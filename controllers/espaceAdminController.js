// Les models d'où viennent les fonctions sur la BDD
const verifConnexion = require('../models/verifConnexion');
const utilisateur = require('../models/utilisateur');
const statistiques = require('../models/statistiques');
const casErreur = require('../models/casErreur');
const avoirDevis = require('../models/avoirDevis');
const jwt = require('jsonwebtoken');
const key = require('../config/tokenKey');
const bcrypt = require('bcrypt');

// Permet d'afficher la page principale de l'espace Admin
exports.espaceAdmin = (request, response) => {
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            jwt.verify(token, key.key, (err, decoded) => {
                if (err) {
                    response.redirect('/Connexion');
                }
                else {
                    const NumUtilisateur = decoded.NumUtilisateur;
                    response.render('pages/admin/espaceAdmin', { NumUtilisateur: NumUtilisateur });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            console.log(admin)
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

// Permet d'afficher la page de gestion des clients
exports.gestionClients = (request, response) => {
    let token = request.cookies.token;
    let cas = 10;
    // On regarde s'il y a des cookies pour la gestion des clients
    if (request.cookies.gestion != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestion.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestion', request.cookies.gestion);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On remplie le tableau des non validés
            utilisateur.avoirUtilisateurNV((utilisateursNV) => {
                // Puis celui des validés
                utilisateur.avoirUtilisateurV((utilisateursV) => {
                    // Et on rend tout avec le potetiel cas d'erreur / succès
                    response.render('pages/admin/gestionClients', { utilisateursNV: utilisateursNV, utilisateursV: utilisateursV, cas: cas });
                });
            });
        }
        else {
            // On indique que l'accès est interdit
            console.log(admin)
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

// Permet de supprimer un utilisateur
exports.supprimerUtilisateur = (request, response) => {
    let NumUtilisateur = request.params.numUtilisateur;
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On garde les commentaires postés dans le livre d'or
            // On supprime les liens avec les devis qu'il a
            avoirDevis.supprimerLiensDevisUtilisateur(NumUtilisateur, (cb) => {
                utilisateur.supprimerUtilisateur(NumUtilisateur, (cb) => {
                    // On le supprime, et on indique qu'on l'a bien supprimé sur la page
                    let cas = 1;
                    response.cookie('gestion', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionClients');
                });
            })
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

// Permet de valider un compte utilisateur
exports.validerUtilisateur = (request, response) => {
    let NumUtilisateur = request.params.numUtilisateur;
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            utilisateur.validerUtilisateur(NumUtilisateur, (cb) => {
                // On le valide, et on indique qu'on l'a bien validé sur la page
                let cas = 2;
                response.cookie('gestion', { cas: cas }, { expiresIn: '5s' });
                response.redirect('/EspaceAdmin/GestionClients');
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

// Fonction permettant d'afficher la page des statistiques
exports.statistiques = (request, response) => {
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère les stats des 7 derniers jours
            statistiques.avoirStats((stats) => {
                // Des 7 derniers mois
                statistiques.avoirStatsDesMois((avoirStatsDesMois) => {
                    let vuesMois = [avoirStatsDesMois[6].NombreVisitesStats, avoirStatsDesMois[5].NombreVisitesStats, avoirStatsDesMois[4].NombreVisitesStats, avoirStatsDesMois[3].NombreVisitesStats, avoirStatsDesMois[2].NombreVisitesStats, avoirStatsDesMois[1].NombreVisitesStats, avoirStatsDesMois[0].NombreVisitesStats];
                    let Mois = [avoirStatsDesMois[0].Mois, avoirStatsDesMois[1].Mois, avoirStatsDesMois[2].Mois, avoirStatsDesMois[3].Mois, avoirStatsDesMois[4].Mois, avoirStatsDesMois[5].Mois, avoirStatsDesMois[6].Mois];
                    let CAMois = [avoirStatsDesMois[6].CAMois, avoirStatsDesMois[5].CAMois, avoirStatsDesMois[4].CAMois, avoirStatsDesMois[3].CAMois, avoirStatsDesMois[2].CAMois, avoirStatsDesMois[1].CAMois, avoirStatsDesMois[0].CAMois];
                    let vues = [stats[0].NombreVisitesStats, stats[1].NombreVisitesStats, stats[2].NombreVisitesStats, stats[3].NombreVisitesStats, stats[4].NombreVisitesStats, stats[5].NombreVisitesStats, stats[6].NombreVisitesStats];
                    let jours = [stats[0].Jour, stats[1].Jour, stats[2].Jour, stats[3].Jour, stats[4].Jour, stats[5].Jour, stats[6].Jour];
                    response.render('pages/admin/statistiques', { vues: vues, jours: jours, vuesMois: vuesMois, Mois: Mois, CAMois: CAMois });
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
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            casErreur.casModifMDP(numUtilisateur, mdpAct, newMdp, newMdpConf, (modifMdp) => {
                casErreur.casModifPseudo(pseudo, (cas) => {
                    let test = (cas == 3 || cas == 10) && (modifMdp == 4 || modifMdp == 10);
                    response.cookie('modifInfos', { cas: cas, modifMdp: modifMdp, test: test }, { expiresIn: '5s' });
                    let link = '/EspaceAdmin/' + numUtilisateur + '/ModifierInfosPerso';
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
                })
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