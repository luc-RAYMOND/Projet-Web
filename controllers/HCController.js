var Catégorie = require('../models/categorie');

// Tableau contenant les couples nom / nombre d'articles par catégorie
var contient = [];
var compteur = 0;
// On utilise les fonctions faisant appel à la BDD pour afficher les catégories
// Cette variable permet de remplir le tableau à chaque fois qu'on charge une page
var remplirCatégorie = () => {
    Catégorie.avoirNomCatégories((nom) => {
        compteur = 0;
        Catégorie.avoirNombresCatégories(nom, (num) => {
            // On remplie le tableau des valeurs
            contient[compteur] = { nom: nom[compteur].LibelléCatégorie, num: num[0].ite };
            compteur++;
            if (compteur == nom.length) {
                // On fait un tri_bulle ici permettant d'avoir en premier les catégories avec le plus d'articles
                for (var k = contient.length - 1; k > 0; k--) {
                    for (var j = 0; j < k - 1; j++) {
                        if (contient[j + 1].num > contient[j].num) {
                            var intermediaire = contient[j];
                            contient[j] = contient[j + 1];
                            contient[j + 1] = intermediaire;
                        }
                    }
                }
            }
        });
    });
}

remplirCatégorie();

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/accueilHC', { contient: contient });
}

// Permet de charger la page formations
exports.formations = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/formationsHC', { contient: contient });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/contactHC', { contient: contient });
}

// Permet de charger la page des services de peinture
exports.servicesPeinture = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/services/servicesPeintureHC', { contient: contient });
}

exports.servicesDécors = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/services/servicesDécorsHC', { contient: contient });
}

exports.servicesAnnexes = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/services/servicesAnnexesHC', { contient: contient });
}