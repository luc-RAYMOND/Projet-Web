// Les models d'où viennent les fonctions sur la BDD
const verifConnexion = require('../models/verifConnexion');
const affichage = require('../models/affichage');
const utilisateur = require('../models/utilisateur')
const devis = require('../models/devis');
const avoirDevis = require('../models/avoirDevis');
const ligneCommande = require('../models/ligneCommande');
const avoirLC = require('../models/avoirLC');
const statutDevis = require('../models/statutDevis');
const casErreur = require('../models/casErreur');

// Permet d'accéder à la page de gestion des devis
exports.gestionDevis = (request, response) => {
    let token = request.cookies.token;
    let cas = 10;
    if (request.cookies.gestionDevis != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionDevis.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionDevis', request.cookies.gestionDevis);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère les utilisateurs validés pour les mettre dans la choice box de création de devis
            utilisateur.avoirUtilisateurV((clients) => {
                // on récupère les devis en attente
                devis.avoirDevisClientsAttente((devisClient) => {
                    // Les utilisateurs de ces devis en attente 
                    affichage.avoirUtilisateursDevis(devisClient, (utilisateurs) => {
                        // Et le montant de ces devis
                        affichage.montantDevis(devisClient, (montants) => {
                            // Maintenant on fait les devis en cours
                            devis.avoirDevisClientsCours((devisClientCours) => {
                                // Les utilisateurs de ces devis
                                affichage.avoirUtilisateursDevis(devisClientCours, (utilisateursCours) => {
                                    // Le montant de leurs devis
                                    affichage.montantDevis(devisClientCours, (montantsCours) => {
                                        // Maintenant les factures des clients
                                        devis.avoirFactureClients((factureClients) => {
                                            // Les utilisateurs de ces devis
                                            affichage.avoirUtilisateursDevis(factureClients, (utilsateursFacture) => {
                                                // Le montant des factures
                                                affichage.montantDevis(factureClients, (montantsFactures) => {
                                                    response.render('pages/admin/gestionDevis', {
                                                        clients: clients, cas: cas, devisClient: devisClient, utilisateurs: utilisateurs, montants: montants,
                                                        devisClientCours: devisClientCours, utilisateursCours: utilisateursCours, montantsCours: montantsCours,
                                                        factureClients: factureClients, utilsateursFacture: utilsateursFacture, montantsFactures: montantsFactures
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de créer un devis
exports.ajoutDevis = (request, response) => {
    let user = request.body.utilisateurs;
    let prenomNom = request.body.prenomNom;
    let token = request.cookies.token;
    let i = 1;
    let numUtilisateur = user[0];
    let k = user[i];
    // Si on ne prend pas la case non inscrit
    if (user[0] != "N") {
        // Permet de récupérer le num Utilisateur dans la choicebox
        while (k != ':') {
            numUtilisateur += user[i];
            i++;
            k = user[i]
        }
    }
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            casErreur.casErreurAjoutDevis(numUtilisateur, prenomNom, (cas) => {
                response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                // Entrée incorrecte, on le signale
                if (cas == 2) {
                    response.redirect('/EspaceAdmin/GestionDevis#Partie4');
                }
                // On crée le devis avec un nom et prénom provisoire
                if (cas == 3) {
                    devis.créerDevisAnonyme(prenomNom, (numDevis) => {
                        // Et on redirige vers l'ajout des lignes de commande
                        let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis';
                        response.redirect(link);
                    });
                }
                // On crée le devis avec le bon utilisateur
                if (cas == 4) {
                    devis.créerDevis((numDevis) => {
                        avoirDevis.créerLienDevis(numUtilisateur, numDevis, (cb) => {
                            let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis';
                            response.redirect(link);
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Fonction permettant d'accéder à la page de modif d'un devis
exports.modifDevisPage = (request, response) => {
    let numDevis = request.params.numDevis;
    let token = request.cookies.token;
    let libellé;
    let quantité;
    let prixU;
    let cas = 10;
    if (request.cookies.ajoutLC != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.ajoutLC.cas;
        libellé = request.cookies.ajoutLC.libellé;
        quantité = request.cookies.ajoutLC.quantité;
        prixU = request.cookies.ajoutLC.prixU;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('ajoutLC', request.cookies.ajoutLC);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que le devis demandé existe
            devis.vérifDevis(numDevis, (vérif) => {
                if (vérif[0].tot == 0 || vérif[0].LibelléStatutDevis == 'Terminé') {
                    cas = 1;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionDevis')
                }
                // Il existe, on peut continuer
                else {
                    // On récupère les utilisateurs validés pour les mettre dans la choice box d'association d'utilisateur
                    utilisateur.avoirUtilisateurV((utilisateurs) => {
                        avoirLC.avoirlignesCommandes(numDevis, (LC) => {
                            statutDevis.avoirStatutsDevis((statutDevis) => {
                                // on regarde si le client est enregistré ou non
                                let test = (vérif[0].NomPrénomProv == '-');
                                response.render('pages/admin/modifierDevis', { numDevis: numDevis, cas: cas, libellé: libellé, quantité: quantité, prixU: prixU, LC: LC, statutDevis: statutDevis, test: test, utilisateurs: utilisateurs });
                            });
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Fonction permettant d'ajouter une ligne de commande
exports.ajoutLigneCommande = (request, response) => {
    let numDevis = request.params.numDevis;
    let libellé = request.body.libellé;
    let quantité = request.body.quantité;
    let prixU = request.body.prixU;
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On regarde s'il y a des erreurs
            casErreur.casErreurAjoutLC(libellé, quantité, prixU, (cas) => {
                response.cookie('ajoutLC', { cas: cas, libellé: libellé, quantité: quantité, prixU: prixU }, { expiresIn: '5s' });
                let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie2';
                // Il y a un problème, on le signale
                if (cas != 4) {
                    response.redirect(link);
                }
                else {
                    // On créé la ligne de commande
                    ligneCommande.créerLigneCommande(libellé, quantité, prixU, (numLC) => {
                        // On crée le lien entre cette ligne et le devis
                        avoirLC.créerLienLigneCommandeDevis(numDevis, numLC, (cb) => {
                            // On retoure sur la page d'ajout en affichant le succès
                            response.redirect(link);
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Fonction permettant de supprimer une ligne de commande d'un devis
exports.supprimerLigneCommandeDevis = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    let numLC = request.params.numLC;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que le lien entre ce devis et cette LC existe
            avoirLC.vérifDevisLigneCommande(numDevis, numLC, (vérif) => {
                // Il n'y en a pas, on redirige
                let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie1';
                if (vérif == 0) {
                    cas = 5;
                    response.cookie('ajoutLC', { cas: cas }, { expiresIn: '5s' });
                    response.redirect(link);
                }
                // Ca existe, on supprime d'abord le lien
                else {
                    avoirLC.supprimerLienDevisLC(numDevis, numLC, (cb) => {
                        // Puis la ligne de commande 
                        ligneCommande.supprimerLigneCommande(numLC, (cb) => {
                            cas = 6;
                            response.cookie('ajoutLC', { cas: cas }, { expiresIn: '5s' });
                            response.redirect(link);
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Fonction permettant de changer le statut d'un devis
exports.modifierStatutDevis = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    let statut = request.body.statut;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            devis.vérifDevis(numDevis, (vérif) => {
                if (vérif[0].tot == 0 || vérif[0].LibelléStatutDevis == 'Terminé') {
                    cas = 1;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionDevis')
                }
                else {
                    // Tout va bien, on update le statut
                    if (statut == 'Terminé') {
                        cas = 4
                        response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                        devis.updateStatutDevis(statut, numDevis, (cb) => {
                            response.redirect('/EspaceAdmin/GestionDevis');
                        });
                    }
                    else {
                        let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie3';
                        cas = 7;
                        response.cookie('ajoutLC', { cas: cas }, { expiresIn: '5s' });
                        devis.updateStatutDevis(statut, numDevis, (cb) => {
                            response.redirect(link);
                        });
                    }
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de supprimer un devis (et donc ses lignes de commande)
exports.supprimerDevis = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que le devis demandé existe
            devis.vérifDevis(numDevis, (vérif) => {
                if (vérif[0].tot == 0) {
                    cas = 1;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionDevis')
                }
                // Il existe, on peut continuer
                else {
                    let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie3';
                    cas = 3;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    // On récupère toutes les lignes de commandes qu'à le devis
                    avoirLC.avoirlignesCommandesDevis(numDevis, (LC) => {
                        // On supprime le lien entre un devis et un utilisateur
                        avoirDevis.supprimerLienDevisUtilisateur(numDevis, (next) => {
                            // On supprime d'abord les liens avec ses lignes de commandes
                            avoirLC.supprimerLiensDevisLC(numDevis, (cb) => {
                                // On supprime maintenant toutes les lignes de commandes
                                for (let i = 0; i < LC.length; i++) {
                                    ligneCommande.supprimerLigneCommande(LC[i].NumLigneCommande, (cb) => { });
                                }
                                // Et on supprime le devis en parralèle
                                devis.supprimerDevis(numDevis, (cb) => { });
                                response.redirect('/EspaceAdmin/GestionDevis')
                            });
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Fonction permettant d'associer un utilisateur à un devis
exports.associerUtilisateurDevis = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    let user = request.body.utilisateur;
    let i = 1;
    if (user != undefined) {
        let numUtilisateur = user[0];
        let k = user[i];
        // Permet de récupérer le num Utilisateur dans la choicebox
        while (k != ':') {
            numUtilisateur += user[i];
            i++;
            k = user[i]
        }
        verifConnexion.verifConnexion(token, (admin) => {
            if (admin == 1) {
                // On vérifie que le devis demandé existe
                devis.vérifDevis(numDevis, (vérif) => {
                    if (vérif[0].tot == 0) {
                        cas = 1;
                        response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                        response.redirect('/EspaceAdmin/GestionDevis')
                    }
                    else {
                        // Tout va bien, on met à jour
                        let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie1';
                        cas = 8;
                        response.cookie('ajoutLC', { cas: cas }, { expiresIn: '5s' });
                        // On met le prénom provisoire comme indéfini dans le devis
                        devis.updateNomPrénomProv(numDevis, (cb) => {
                            // On crée le lien entre l'utilisateur et le devis
                            avoirDevis.créerLienDevis(numUtilisateur, numDevis, (cb) => {
                                response.redirect(link);
                            });
                        });
                    }
                });
            }
            else {
                // On indique que l'accès est interdit
                if (admin == 10) {
                    response.cookie('access', { err: true }, { expiresIn: '5s' });
                    response.redirect('/Connexion');
                }
                else {
                    response.cookie('access', { err: true }, { expiresIn: '5s' })
                    response.redirect('/Accueil');
                }
            }
        });
    }
    else {
        let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie4';
        response.redirect(link)
    }
}

// Fonction permettant de modifier l'utilisateur d'un devis 
exports.modifierUtilisateurDevis = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    let user = request.body.utilisateur;
    let i = 1;
    let numUtilisateur = user[0];
    let k = user[i];
    // Permet de récupérer le num Utilisateur dans la choicebox
    while (k != ':') {
        numUtilisateur += user[i];
        i++;
        k = user[i]
    }
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que le devis demandé existe
            devis.vérifDevis(numDevis, (vérif) => {
                if (vérif[0].tot == 0) {
                    cas = 1;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionDevis')
                }
                else {
                    // Tout est bon, on peut update l'utilisateur
                    let link = '/EspaceAdmin/GestionDevis/' + numDevis + '/ModifierDevis#Partie1';
                    cas = 9;
                    response.cookie('ajoutLC', { cas: cas }, { expiresIn: '5s' });
                    // On update le lien entre l'utilisateur et le devis
                    avoirDevis.updateLienDevis(numUtilisateur, numDevis, (cb) => {
                        response.redirect(link);
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de consulter le détail d'une facture
exports.consulterFacture = (request, response) => {
    let token = request.cookies.token;
    let numDevis = request.params.numDevis;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que le devis demandé existe
            devis.vérifDevis(numDevis, (vérif) => {
                if (vérif[0].tot == 0) {
                    cas = 1;
                    response.cookie('gestionDevis', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionDevis')
                }
                else {
                    // On récupère les lignes de commandes pour les afficher
                    avoirLC.avoirlignesCommandes(numDevis, (LC) => {
                        response.render('pages/admin/consulterFacture', { numDevis: numDevis, LC: LC, admin: admin });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}