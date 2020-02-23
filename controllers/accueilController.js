// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js')

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    var pageActuelle = 1;
    affichage.remplirCatégorie(request, response, (contient) => {
        affichage.remplirArticle(request, response, contient, (articles) => {
            affichage.remplirCatégorieArticle(request, response, contient, articles, (cat) => {
                affichage.remplirImageArticle(request, response, contient, articles, cat, (img) => {
                    var trimStart = (pageActuelle - 1) * 5;
                    var trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    var slicedArticles = articles.slice(trimStart, trimEnd);
                    var slicedCat = cat.slice(trimStart, trimEnd);
                    var slicedImg = img.slice(trimStart, trimEnd);
                    var pageMax = Math.ceil(articles.length / 5);
                    response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax });
                });
            });
        });
    });
}

// Permet d'afficher les autres pages sur l'accueil
exports.accueilPage = (request, response) => {
    var pageActuelle = request.params.numPage;
    affichage.remplirCatégorie(request, response, (contient) => {
        affichage.remplirArticle(request, response, contient, (articles) => {
            affichage.remplirCatégorieArticle(request, response, contient, articles, (cat) => {
                affichage.remplirImageArticle(request, response, contient, articles, cat, (img) => {
                    var trimStart = (pageActuelle - 1) * 5;
                    var trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    var slicedArticles = articles.slice(trimStart, trimEnd);
                    var slicedCat = cat.slice(trimStart, trimEnd);
                    var slicedImg = img.slice(trimStart, trimEnd);
                    var pageMax = Math.ceil(articles.length / 5);
                    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
                        response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax });
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