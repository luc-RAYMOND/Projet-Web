// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js')
var statistiques = require('../models/statistiques')
var verifConnexion = require('../models/verifConnexion');

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    var token = request.cookies.token;
    var pageActuelle = 1;
    var cas = 10;
    statistiques.avoirStatsMois((cb) => { });
    if (request.cookies.infoA != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.infoA.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('infoA', request.cookies.infoA);
    // Si le cookie vue n'existe pas, on ajoute de 1 la vue sur le site
    if (request.cookies.vue == undefined) {
        // On crée un cookie qui restera 1h
        response.cookie('vue', { expiresIn: '1h' });
        // On ajoute une vue
        statistiques.gagnerUneVue((cb) => { });
    }
    affichage.remplirCatégorie((contient) => {
        affichage.remplirArticle((articles) => {
            affichage.remplirCatégorieArticle(articles, (cat) => {
                affichage.remplirImageArticle(articles, (img) => {
                    var trimStart = (pageActuelle - 1) * 5;
                    var trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    var slicedArticles = articles.slice(trimStart, trimEnd);
                    var slicedCat = cat.slice(trimStart, trimEnd);
                    var slicedImg = img.slice(trimStart, trimEnd);
                    var pageMax = Math.ceil(articles.length / 5);
                    // Selon les informations du token, on affiche l'accueil différemment
                    verifConnexion.verifConnexion(token, (admin) => {
                        response.render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin, cas: cas });
                    });
                });
            });
        });
    });
}

// Permet d'afficher les autres pages sur l'accueil
exports.accueilPage = (request, response) => {
    var token = request.cookies.token;
    var cas = 10;
    var pageActuelle = request.params.numPage;
    affichage.remplirCatégorie((contient) => {
        affichage.remplirArticle((articles) => {
            affichage.remplirCatégorieArticle(articles, (cat) => {
                affichage.remplirImageArticle(articles, (img) => {
                    var trimStart = (pageActuelle - 1) * 5;
                    var trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    var slicedArticles = articles.slice(trimStart, trimEnd);
                    var slicedCat = cat.slice(trimStart, trimEnd);
                    var slicedImg = img.slice(trimStart, trimEnd);
                    var pageMax = Math.ceil(articles.length / 5);
                    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
                        // Selon les informations du token, on affiche l'accueil différemment
                        verifConnexion.verifConnexion(token, (admin) => {
                            response.render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin, cas: cas });
                        });
                    }
                    else {
                        // Si URL non valide
                        response.send("404 not found");
                    }
                });
            });
        });
    });
}