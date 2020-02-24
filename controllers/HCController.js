// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage');
var utilisateur = require('../models/utilisateur');
// Pour pouvoir faire un token
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');
// Pour comparer les mots de passe
var bcrypt = require('bcrypt');

// Permet de charger la page formations
exports.formations = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/formationsHC', { contient: next });
    });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    affichage.remplirCatégorie(request, response, (next) => {
        response.render('pages/HC/quiSuisJeHC', { contient: next });
    });
}

// Permet de charger la page de connexion
exports.connexion = (request, response) => {
    var cas = 5;
    response.render('pages/HC/connexion', { cas: cas });
}

// Permet de vérifier les informations de connexion
exports.tentativeConnexion = (request, response) => {
    var mail = request.body.mail;
    var mdp = request.body.mdp;
    var cas;
    utilisateur.mailExiste(mail, (bonMDP) => {
        // Cas de mauvais mail
        if (bonMDP[0] == undefined) {
            cas = 0;
            response.render('pages/HC/connexion', { cas: cas });
        }
        else {
            // On compare les 2 mots de passe
            bcrypt.compare(mdp, bonMDP[0].MotDePasseUtilisateur, function (err, result) {
                // Tout est bon, on se connecte
                if (result) {
                    // On créé un token qui contiendra le NumUtilisateur et AdminUtilisateur pour savoir s'il est admin ou non
                    var token = jwt.sign({ NumUtilisateur: bonMDP[0].NumUtilisateur, AdminUtilisateur: bonMDP[0].AdminUtilisateur }, key.key, { expiresIn: '1h' }, (err, token) => {
                        if (err) throw err;
                        // Tout est bon, on est connecté et redirigé à l'accueil
                        response.cookie('token', token);
                        response.redirect('/Accueil');
                    });
                }
                // Cas de mauvais mot de passe
                else {
                    cas = 1;
                    response.render('pages/HC/Connexion', { cas: cas });
                }
            });
        }
    });
}