// Les models d'où viennent les fonctions sur la BDD
const affichage = require('../models/affichage.js');
const Catégorie = require('../models/categorie');
const verifConnexion = require('../models/verifConnexion');

// Permet d'avoir les pages selon les catégories
exports.catégoriesPage = (request, response) => {
    let token = request.cookies.token;
    let pageActuelle = request.params.numPage;
    let numcategorie = request.params.numcategorie;
    let data = true;
    affichage.remplirCatégorie((contient) => {
        // On vérifie qu'il y a bien une catégorie avec ce numéro
        Catégorie.vérifierNumCatégorie(numcategorie, (tot) => {
            if (tot == 0) {
                response.status(404).render('pages/common/404notfound');
            }
            else {
                affichage.remplirArticleCatégorie(numcategorie, (articles) => {
                    // S'il n'y a pas d'articles pour cette catégorie
                    if (articles[0] == undefined) {
                        data = false;
                        Catégorie.avoirLibellé(numcategorie, (Lib) => {
                            verifConnexion.verifConnexion(token, (admin) => {
                                if (pageActuelle == 1) {
                                    response.render('pages/common/catégories', { contient: contient, data: data, Lib: Lib, admin: admin });
                                }
                                else {
                                    response.status(404).render('pages/common/404notfound');
                                }
                            });
                        });
                    }
                    else {
                        // S'il y en a
                        affichage.remplirCatégorieArticle(articles, (cat) => {
                            affichage.remplirImageArticle(articles, (img) => {
                                let trimStart = (pageActuelle - 1) * 5;
                                let trimEnd = trimStart + 5;
                                // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                                let slicedArticles = articles.slice(trimStart, trimEnd);
                                let slicedCat = cat.slice(trimStart, trimEnd);
                                let slicedImg = img.slice(trimStart, trimEnd);
                                let pageMax = Math.ceil(articles.length / 5);
                                // data nous permet de modifier l'affichage selon si il n'y a pas d'articles dans une catégorie
                                // On récupère le nom de la catégorie pour l'afficher
                                Catégorie.avoirLibellé(numcategorie, (Lib) => {
                                    // On vérifie le numéro de la page
                                    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 1 && pageActuelle <= pageMax)) {
                                        verifConnexion.verifConnexion(token, (admin) => {
                                            response.render('pages/common/catégories', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, data: data, numcategorie: numcategorie, Lib: Lib, admin: admin });
                                        });
                                    }
                                    else {
                                        // Si URL non valide
                                        response.status(404).render('pages/common/404notfound');
                                    }
                                });
                            });
                        });
                    }
                });
            }
        });
    });
}