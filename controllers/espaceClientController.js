// Les models d'où viennent les fonctions sur la BDD
var verifConnexion = require('../models/verifConnexion');
var utilisateur = require('../models/utilisateur');
var statistiques = require('../models/statistiques');
var casErreur = require('../models/casErreur');
var verifConnexion = require('../models/verifConnexion');
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');
var bcrypt = require('bcrypt');

// Permet d'afficher la page principale de l'espace client
exports.espaceClient = (request, response) => {
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 0) {
            jwt.verify(token, key.key, (err, decoded) => {
                const NumUtilisateur = decoded.NumUtilisateur;
                response.render('pages/utilisateur/espaceClient', { NumUtilisateur: NumUtilisateur });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'accéder à la page de modification des infos persos du compte
exports.modifierInfosPersoPage = (request, response) => {
    var cas = 10;
    var modifMdp = 10;
    var test = false;
    var token = request.cookies.token;
    var numUtilisateur = request.params.numUtilisateur
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
            const NumUtilisateur = decoded.NumUtilisateur;
            // On vérifie que c'est bien le bon utilisateur qui veut modifier les infos
            if (numUtilisateur == NumUtilisateur) {
                // On récupère les données de l'utilisateur
                utilisateur.avoirUtilisateur(NumUtilisateur, (user) => {
                    response.render('pages/common/modifierInfosPerso', { admin: admin, user: user, cas: cas, modifMdp: modifMdp, test: test });
                });
            }
            else {
                response.redirect('/Accueil');
            }
        });
    });
}

// Permet de modifier les infos
exports.modifierInfosPerso = (request, response) => {
    // On récupère toutes les données du formulaire
    var numUtilisateur = request.params.numUtilisateur;
    var pseudo = request.body.pseudo;
    var mdpAct = request.body.mdpAct;
    var newMdp = request.body.newMdp;
    var newMdpConf = request.body.newMdpConf;
    var tel = request.body.tel;
    var ville = request.body.ville;
    var rue = request.body.rue;
    var cp = request.body.cp;
    var pays = request.body.pays;
    var date = request.body.date;
    var saltRounds = 10;
    casErreur.casModifMDP(numUtilisateur, mdpAct, newMdp, newMdpConf, (modifMdp) => {
        casErreur.casModifPseudo(pseudo, (cas) => {
            var test = (cas == 3 || cas == 10) && (modifMdp == 4 || modifMdp == 10);
            response.cookie('modifInfos', { cas: cas, modifMdp: modifMdp, test: test }, { expiresIn: '5s' });
            var link = '/EspaceAdmin/' + numUtilisateur + '/ModifierInfosPerso';
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