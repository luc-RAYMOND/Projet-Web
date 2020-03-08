// Les models d'où viennent les fonctions sur la BDD
const verifConnexion = require('../models/verifConnexion');
const utilisateur = require('../models/utilisateur');
const devis = require('../models/devis');
const avoirLC = require('../models/avoirLC');
const affichage = require('../models/affichage');
const casErreur = require('../models/casErreur');
const jwt = require('jsonwebtoken');
const key = require('../config/tokenKey');
const bcrypt = require('bcrypt');

// Permet d'afficher la page principale de l'espace client
exports.espaceClient = (request, response) => {
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 0) {
            jwt.verify(token, key.key, (err, decoded) => {
                if (err) {
                    response.redirect('/Connexion');
                }
                else {
                    const NumUtilisateur = decoded.NumUtilisateur;
                    response.render('pages/utilisateur/espaceClient', { NumUtilisateur: NumUtilisateur });
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

// Permet d'accéder à la page de modification des infos persos du compte
exports.modifierInfosPersoPage = (request, response) => {
    let cas = 10;
    let modifMdp = 10;
    let test = false;
    let token = request.cookies.token;
    let numUtilisateur = request.params.numUtilisateur
    // On regarde s'il y a des cookies pour la gestion des clients
    if (request.cookies.modifInfos != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.modifInfos.cas;
        modifMdp = request.cookies.modifInfos.modifMdp;
        test = request.cookies.modifInfos.test;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('modifInfos', request.cookies.modifInfos);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 0) {
            jwt.verify(token, key.key, (err, decoded) => {
                if (err) {
                    response.redirect('/Connexion');
                }
                else {
                    const NumUtilisateur = decoded.NumUtilisateur;
                    // On vérifie que c'est bien le bon utilisateur qui veut modifier les infos
                    if (numUtilisateur == NumUtilisateur) {
                        // On récupère les données de l'utilisateur
                        utilisateur.avoirUtilisateur(NumUtilisateur, (user) => {
                            response.render('pages/common/modifierInfosPerso', { admin: admin, user: user, cas: cas, modifMdp: modifMdp, test: test });
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
                }
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de modifier les infos
exports.modifierInfosPerso = (request, response) => {
    // On récupère toutes les données du formulaire
    let token = request.cookies.token;
    let numUtilisateur = request.params.numUtilisateur;
    let pseudo = request.body.pseudo;
    let mdpAct = request.body.mdpAct;
    let newMdp = request.body.newMdp;
    let newMdpConf = request.body.newMdpConf;
    let tel = request.body.tel;
    let ville = request.body.ville;
    let rue = request.body.rue;
    let cp = request.body.cp;
    let pays = request.body.pays;
    let date = request.body.date;
    let saltRounds = 10;
    casErreur.casModifMDP(numUtilisateur, mdpAct, newMdp, newMdpConf, (modifMdp) => {
        verifConnexion.verifConnexion(token, (admin) => {
            if (admin == 0) {
                jwt.verify(token, key.key, (err, decoded) => {
                    if (err) {
                        response.redirect('/Connexion');
                    }
                    else {
                        const NumUtilisateur = decoded.NumUtilisateur;
                        // On vérifie que c'est bien le bon utilisateur qui veut modifier les infos
                        if (numUtilisateur == NumUtilisateur) {
                            casErreur.casModifPseudo(pseudo, (cas) => {
                                let test = (cas == 3 || cas == 10) && (modifMdp == 4 || modifMdp == 10);
                                response.cookie('modifInfos', { cas: cas, modifMdp: modifMdp, test: test }, { expiresIn: '5s' });
                                let link = '/EspaceClient/' + numUtilisateur + '/ModifierInfosPerso';
                                // On peut changer le pseudo
                                if (cas == 3) {
                                    utilisateur.modifPseudo(pseudo, numUtilisateur, (next) => {
                                    });
                                }
                                // Le changement de mot de passe est bon, on peut l'update
                                if (modifMdp == 4) {
                                    bcrypt.hash(newMdp, saltRounds, (err, mdpHash) => {
                                        utilisateur.modifMdp(mdpHash, numUtilisateur, (cb) => {
                                        });
                                    });
                                }
                                // Il n'y a pas eu d'erreur, on update aussi les infos de facturation
                                if (test) {
                                    utilisateur.updateInfo(tel, ville, rue, cp, pays, date, numUtilisateur, (cb) => {
                                    });
                                }
                                response.redirect(link);
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
    });
}

// Permet de voir les devis d'un client en particulier
exports.voirDevis = (request, response) => {
    let numUtilisateur = request.params.numUtilisateur;
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 0) {
            jwt.verify(token, key.key, (err, decoded) => {
                if (err) {
                    response.redirect('/Connexion');
                }
                else {
                    const NumUtilisateur = decoded.NumUtilisateur;
                    // On vérifie que c'est bien le bon utilisateur qui veut voir ses devis
                    if (numUtilisateur == NumUtilisateur) {
                        // On récupère les utilisateurs validés pour les mettre dans la choice box de création de devis
                        utilisateur.avoirUtilisateur(numUtilisateur, (user) => {
                            // on récupère les devis en attente
                            devis.avoirDevisClientAttente(numUtilisateur, (devisClient) => {
                                // Les montants
                                affichage.montantDevis(devisClient, (montants) => {
                                    // Maintenant on fait les devis en cours
                                    devis.avoirDevisClientCours(numUtilisateur, (devisClientCours) => {
                                        // Le montant des devis
                                        affichage.montantDevis(devisClientCours, (montantsCours) => {
                                            // Maintenant les factures du client
                                            devis.avoirFactureClient(numUtilisateur, (factureClients) => {
                                                // Le montant des factures
                                                affichage.montantDevis(factureClients, (montantsFactures) => {
                                                    response.render('pages/utilisateur/voirDevis', {
                                                        devisClient: devisClient, user: user, montants: montants,
                                                        devisClientCours: devisClientCours, montantsCours: montantsCours,
                                                        factureClients: factureClients, montantsFactures: montantsFactures
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
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

// Permet de consulter le détail d'un(e) facture/devis
exports.consulterDevisFacture = (request, response) => {
    let token = request.cookies.token;
    let numUtilisateur = request.params.numUtilisateur;
    let numDevis = request.params.numDevis;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 0) {
            jwt.verify(token, key.key, (err, decoded) => {
                if (err) {
                    response.redirect('/Connexion');
                }
                else {
                    const NumUtilisateur = decoded.NumUtilisateur;
                    // On vérifie que c'est bien le bon utilisateur qui veut voir ses devis
                    if (numUtilisateur == NumUtilisateur) {
                        // On vérifie que le devis demandé existe
                        devis.vérifAvoirDevis(numDevis, NumUtilisateur, (vérif) => {
                            if (vérif == 0) {
                                const link = '/EspaceClient/' + numUtilisateur + '/VoirDevis';
                                response.redirect(link)
                            }
                            else {
                                // On récupère les lignes de commandes pour les afficher
                                avoirLC.avoirlignesCommandes(numDevis, (LC) => {
                                    response.render('pages/admin/consulterFacture', { numDevis: numDevis, LC: LC, admin: admin, NumUtilisateur: NumUtilisateur });
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