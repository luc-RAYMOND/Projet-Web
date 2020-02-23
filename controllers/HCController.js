// Les models d'où viennent les fonctions sur la BDD
var Catégorie = require('../models/categorie');

// Tableau contenant les couples nom / nombre d'articles par catégorie
var contient = [];
var compteur1 = 0;
// On utilise les fonctions faisant appel à la BDD pour afficher les catégories
// Cette variable permet de remplir le tableau à chaque fois qu'on charge une page
var remplirCatégorie = () => {
    Catégorie.avoirNomCatégories((nom) => {
        compteur1 = 0;
        Catégorie.avoirNombresCatégories(nom, (num) => {
            // On remplie le tableau des valeurs
            contient[compteur1] = { nom: nom[compteur1].LibelléCatégorie, num: num[0].ite };
            compteur1++;
            if (compteur1 == nom.length) {
                // On fait un tri bulle ici permettant d'avoir en premier les catégories avec le plus d'articles
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

// Permet de charger la page formations
exports.formations = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/formationsHC', { contient: contient });
}

// Permet de charger la page qui suis-je ?
exports.contact = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/quiSuisJeHC', { contient: contient });
}