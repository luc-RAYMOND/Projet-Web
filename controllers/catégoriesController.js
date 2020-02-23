// Les models d'où viennent les fonctions sur la BDD
var affichage = require('../models/affichage.js');
var Catégorie = require('../models/categorie');

// Permet d'avoir les pages selon les catégories
exports.catégoriesPage = (request, response) => {
    var pageActuelle = request.params.numPage;
    var numcategorie = request.params.numcategorie;
    var data = true;
    affichage.remplirCatégorie(request, response, (contient) => {
        affichage.remplirArticleCatégorie(request, response, contient, numcategorie, (articles) => {
            if (articles[0] === undefined) {
                data = false;
                Catégorie.avoirLibellé(numcategorie, (Lib) => {
                    response.render('pages/HC/catégoriesHC', { contient: contient, data: data, Lib: Lib });
                });
            }
            else {
                affichage.remplirCatégorieArticle(request, response, contient, articles, (cat) => {
                    affichage.remplirImageArticle(request, response, contient, articles, cat, (img) => {
                        var trimStart = (pageActuelle - 1) * 5;
                        var trimEnd = trimStart + 5;
                        // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                        var slicedArticles = articles.slice(trimStart, trimEnd);
                        var slicedCat = cat.slice(trimStart, trimEnd);
                        var slicedImg = img.slice(trimStart, trimEnd);
                        var pageMax = Math.ceil(articles.length / 5);
                        // data nous permet de modifier l'affichage selon si il n'y a pas d'articles dans une catégorie
                        // On récupère le nom de la catégorie pour l'afficher
                        Catégorie.avoirLibellé(numcategorie, (Lib) => {
                            // On vérifie le numéro de la page
                            if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 1 && pageActuelle <= pageMax)) {
                                response.render('pages/HC/catégoriesHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, data: data, numcategorie: numcategorie, Lib: Lib });
                            }
                            else {
                                // Si URL non valide
                                response.send("404 not found");
                            }
                        });
                    });
                });
            }
        });
    });
}