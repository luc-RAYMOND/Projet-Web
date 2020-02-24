// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js')
var verifConnexion = require('../models/verifConnexion');

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    var token = request.cookies.token;
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
                    // Selon les informations du token, on affiche l'accueil différemment
                    verifConnexion.verifConnexion(token, (admin) => {
                        response.render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin });
                    });
                });
            });
        });
    });
}

// Permet d'afficher les autres pages sur l'accueil
exports.accueilPage = (request, response) => {
    var token = request.cookies.token;
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
                        // Selon les informations du token, on affiche l'accueil différemment
                        verifConnexion.verifConnexion(token, (admin) => {
                            response.render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin });
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