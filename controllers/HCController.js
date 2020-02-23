// Les models d'où viennent les fonctions sur la BDD
var Catégorie = require('../models/categorie');
var Article = require('../models/article');

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


// Va contenir tous les articles
var articles = [];
// Va contenir les catégories de chaque article
var cat = [];
// Va contenir le lien des images de chaque article
var img = [];
var compteur2 = 0;
var compteur3 = 0;
var remplirArticle = () => {
    Article.avoirArticles((art) => {
        // On rentre les valeurs dans l'article correspondant
        for (var i = 0; i < art.length; i++) {
            articles[i] =
            {
                TitreArticle: art[i].TitreArticle,
                DateArticle: art[i].DateArticle,
                TexteArticle: art[i].TexteArticle,
            };
        }
        compteur2 = 0;
        // On remplie les valeurs des libellé de catégorie
        Article.avoirLibellé(art, (libCat) => {
            cat[compteur2] = libCat;
            compteur2++;
        });
        compteur3 = 0;
        // On remplie les valeurs de lien d'image
        Article.avoirImage(art, (lienImg) => {
            img[compteur3] = lienImg;
            compteur3++;
        });
    });
}

remplirArticle();
remplirCatégorie();

// Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
var slicedArticles;
var slicedCat;
var slicedImg;
// Le nombre de pages max
var pageMax = Math.ceil(articles.length / 5);

// Cette fonction permet, selon la page sur laquelle on est, de coupé nos articles
// Et d'avoir le nombre de pages max
function pagination(Page) {
    var trimStart = (Page - 1) * 5;
    var trimEnd = trimStart + 5;
    slicedArticles = articles.slice(trimStart, trimEnd);
    slicedCat = cat.slice(trimStart, trimEnd);
    slicedImg = img.slice(trimStart, trimEnd);
    pageMax = Math.ceil(articles.length / 5);
}

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    remplirCatégorie();
    remplirArticle();
    pagination(1);
    pageActuelle = 1;
    response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageMax: pageMax, pageActuelle: pageActuelle  });
}

// Permet d'avoir les autres pages de la page d'accueil
exports.accueilPage = (request, response) => {
    remplirCatégorie();
    remplirArticle();
    // On récupère le numéro de la page demandée dans l'URL
    pageActuelle = request.params.numPage;
    pageMax = Math.ceil(articles.length / 5);
    // On vérifie la validité de l'entrée de l'URL
    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
        pagination(pageActuelle);
        response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageMax: pageMax, pageActuelle: pageActuelle });
    }
    else {
        response.send("404 not found");
    }
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

// Permet de charger la page des services de décors
exports.servicesDécors = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/services/servicesDécorsHC', { contient: contient });
}

// Permet de charger la page des services annexes
exports.servicesAnnexes = (request, response) => {
    remplirCatégorie();
    response.render('pages/HC/services/servicesAnnexesHC', { contient: contient });
}