// Les models d'où viennent les fonctions sur la BDD
const affichage = require('../models/affichage.js')
const statistiques = require('../models/statistiques')
const verifConnexion = require('../models/verifConnexion');

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    let token = request.cookies.token;
    let pageActuelle = 1;
    let cas = 10;
    status = 200;
    statistiques.avoirStatsMois((cb) => { });
    if (request.cookies.infoA != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.infoA.cas;
    }
    if (request.cookies.access != undefined) {
        // On récupère toutes les valeurs
        console.log("here")
        cas = 20;
        status = 403;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('infoA', request.cookies.infoA);
    response.clearCookie('access', request.cookies.access);
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
                    let trimStart = (pageActuelle - 1) * 5;
                    let trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    let slicedArticles = articles.slice(trimStart, trimEnd);
                    let slicedCat = cat.slice(trimStart, trimEnd);
                    let slicedImg = img.slice(trimStart, trimEnd);
                    let pageMax = Math.ceil(articles.length / 5);
                    // Selon les informations du token, on affiche l'accueil différemment
                    verifConnexion.verifConnexion(token, (admin) => {
                        response.status(status).render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin, cas: cas });
                    });
                });
            });
        });
    });
}

// Permet d'afficher les autres pages sur l'accueil
exports.accueilPage = (request, response) => {
    let token = request.cookies.token;
    let cas = 10;
    let pageActuelle = request.params.numPage;
    affichage.remplirCatégorie((contient) => {
        affichage.remplirArticle((articles) => {
            affichage.remplirCatégorieArticle(articles, (cat) => {
                affichage.remplirImageArticle(articles, (img) => {
                    let trimStart = (pageActuelle - 1) * 5;
                    let trimEnd = trimStart + 5;
                    // Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
                    let slicedArticles = articles.slice(trimStart, trimEnd);
                    let slicedCat = cat.slice(trimStart, trimEnd);
                    let slicedImg = img.slice(trimStart, trimEnd);
                    let pageMax = Math.ceil(articles.length / 5);
                    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
                        // Selon les informations du token, on affiche l'accueil différemment
                        verifConnexion.verifConnexion(token, (admin) => {
                            response.render('pages/common/accueil', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageActuelle: pageActuelle, pageMax: pageMax, admin: admin, cas: cas });
                        });
                    }
                    else {
                        // Si URL non valide
                        response.status(404).render('pages/common/404notfound');
                    }
                });
            });
        });
    });
}