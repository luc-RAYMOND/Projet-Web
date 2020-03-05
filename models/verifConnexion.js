// Pour les tokens
var jwt = require('jsonwebtoken');
var key = require('../config/tokenKey');

// Cette fonction permet de vérifier si l'on est connecté ou non
exports.verifConnexion = (token, admin) => {
    var ad = 10;
    // On regarde si le token existe ou non
    if (token == undefined) {
        ad = 10;
    }
    else {
        jwt.verify(token, key.key, (err,decoded) => {
            // On regarde si le token est expiré ou non
            if (err) {
                ad = 10;
            }
            else {
                switch (decoded.AdminUtilisateur) {
                    // Cas administrateur
                    case 1:
                        ad = 1;
                        break;
                    // Cas utilisateur
                    case 0:
                        ad = 0;
                        break;
                    // Par défault, non connecté
                    default:
                        ad = 10;
                }
            }
        });
    }
    admin(ad);
}
