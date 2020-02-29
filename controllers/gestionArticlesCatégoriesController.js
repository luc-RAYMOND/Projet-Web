// Les models d'où viennent les fonctions sur la BDD
var verifConnexion = require('../models/verifConnexion');
var casErreur = require('../models/casErreur');
var Catégorie = require('../models/categorie')
var article = require('../models/article');
var image = require('../models/image');
var avoirImage = require('../models/avoirImage');
var avoircategorie = require('../models/avoirCatégorie');

// Va nous permettre de gérer l'upload d'image
const multer = require('multer');
const fs = require('fs');

// Espace de stockage des images
const storage = multer.diskStorage({
    destination: './public/images/articles/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})

// Va nous permettre de récupérer et stocker les images
const upload = multer({
    storage: storage,
}).array('images', 10);

// Permet d'accéder à la page de gestion des articles et catégories
exports.gestionArticlesCatégories = (request, response) => {
    var token = request.cookies.token;
    var cas = 10;
    var titreArticle = '';
    var texteArticle = '';
    if (request.cookies.gestionAC != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionAC.cas;
        titreArticle = request.cookies.gestionAC.titreArticle;
        texteArticle = request.cookies.gestionAC.texteArticle;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionAC', request.cookies.gestionAC);
    verifConnexion.verifConnexion(token, (admin) => {
        Catégorie.avoirNomCatégories((catégories) => {
            if (admin == 1) {
                response.render('pages/admin/gestionArticlesCatégories', { catégories: catégories, cas: cas, titreArticle: titreArticle, texteArticle: texteArticle });
            }
            else {
                response.redirect('/Connexion');
            }
        });
    });
}

exports.ajoutCatégorie = (request, response) => {
    var token = request.cookies.token;
    // On récupère le libellé entré
    var libCat = request.body.libCat;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère le cas d'erreur ou de succès
            casErreur.casAjoutCatégorie(libCat, (cas) => {
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                // On peut l'insérer dans la BDD
                if (cas == 2) {
                    Catégorie.ajouterCatégorie(libCat, (cb) => {
                    });
                }
                response.redirect('/EspaceAdmin/GestionArticlesCategories');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer une catégorie
exports.supprimerCatégorie = (request, response) => {
    var numCat = request.params.numCat;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            Catégorie.supprimerCatégorie(numCat, (cb) => {
                // On le supprime, et on indique qu'on l'a bien supprimé sur la page
                var cas = 3;
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                response.redirect('/EspaceAdmin/GestionArticlesCategories');
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'accéder à la page de modification d'une catégorie
exports.modifierCatégoriePage = (request, response) => {
    var numCat = request.params.numCat;
    var token = request.cookies.token;
    var cas = 10;
    if (request.cookies.gestionAC != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionAC.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionAC', request.cookies.gestionAC);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On rend la page en remplissant le champ et en renvoyant le cas d'erreur s'il y en a
            Catégorie.avoirLibellé(numCat, (libCat) => {
                response.render('pages/admin/modifierCatégorie', { cas: cas, libCat: libCat, numCat: numCat });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de modifier la catégorie
exports.modifierCatégorie = (request, response) => {
    var numCat = request.params.numCat;
    var libCat = request.body.libCat;
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On recupère le libellé de base, pour qu'on sache dans quel cas on est
            casErreur.casModifCatégorie(numCat, libCat, (cas) => {
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                if (cas == 4) {
                    // Tout est bon, on modifie
                    Catégorie.modifierCatégorie(libCat, numCat, (cb) => {
                        response.redirect('/EspaceAdmin/GestionArticlesCategories');
                    });
                }
                // Sinon on renvoie l'erreur dans le cookie et on redirige
                else {
                    var link = '/EspaceAdmin/GestionArticlesCategories/' + numCat + '/ModifierCategorie';
                    response.redirect(link)
                }
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet d'ajouter un article
exports.ajoutArticle = (request, response) => {
    var token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            upload(request, response, (err) => {
                if (err) throw err;
                else {
                    var titreArticle = request.body.TitreArticle;
                    var texteArticle = request.body.texteArticle;
                    var catégories = request.body.Categories;
                    var images = request.files
                    //var images = request.body.images;
                    // On récupère le cas d'erreur s'il y en a un
                    casErreur.casErreurAjoutArticle(titreArticle, texteArticle, catégories, (cas) => {
                        // Tout va bien, on crée l'article
                        if (cas == 8) {
                            response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                            article.ajoutArticle(titreArticle, texteArticle, (numArticle) => {
                                // Ainsi que les liens avec les catégories
                                avoircategorie.ajoutUnLienArticleCatégorie(catégories, numArticle, (next) => { });
                                // Ajout des liens des images en BDD avec les lien image/article
                                for (var i = 0; i < images.length; i++) {
                                    image.ajoutImage(images[i].filename, (numImg) => {
                                        avoirImage.ajoutAvoirImage(numImg, numArticle, (cb) => { });
                                    });
                                }
                            });
                            // On indique que c'est un succès, on a pas besoin d'attendre la fin des créations pour l'afficher
                            response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie3')
                        }
                        else {
                            // Sinon on affiche le cas d'erreur
                            response.cookie('gestionAC', { titreArticle: titreArticle, texteArticle: texteArticle, cas: cas }, { expiresIn: '5s' });
                            response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie3');
                            // On supprime les immages qui viennent d'être upload
                            for (var i = 0; i < images.length; i++) {
                                var link = 'public/images/articles/' + images[i].filename;
                                fs.unlink(link, (err) => {
                                    if (err) throw err;
                                });
                            }
                        }
                    });
                }
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de charger la page contenant l'article que l'on veut modifier

// Permet de supprimer un article (et avec, ses images)
exports.supprimerArticle = (request,response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On supprime également les images du serveur, par contre on garde les catégories intactes
            avoirImage.avoirImagesArticle(numArticle, (numsImg) => {
                // On supprime les liens entre images/article
                avoirImage.supprimerLienImageArticle(numArticle, (next1) =>{
                    // On supprime les liens catégories/article
                    avoircategorie.supprimerCatégorieImageArticle(numArticle,  (next2) => {
                        // On enlève les images du serveur
                        image.supprimerImages(numsImg, (next2) => {
                            // Et enfin on supprime l'article
                            article.supprimerArticle(numArticle, (next3) => {
                                var cas = 1;
                                response.cookie('infoA', { cas: cas }, { expiresIn: '5s' });
                                response.redirect('/Accueil');
                            });
                        });
                    });

                });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de modifier un article