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
const multerGoogleStorage = require('multer-google-storage');

// Nous permet d'upload les images sur le cloud
var uploadHandler = multer({
    storage: multerGoogleStorage.storageEngine({
        keyFilename: "./sonic-ego-270221-523d55cbcddb.json",
        projectId: 'sonic-ego-270221',
        bucket: 'atelier-alegolas91'
    })
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
                        response.redirect('/EspaceAdmin/GestionArticlesCategories');
                    });
                }
                else {
                    response.redirect('/EspaceAdmin/GestionArticlesCategories');
                }
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
            Catégorie.avoirLibellé(numCat, (libCat) => {
                // On vérifie que la catégorie existe
                if (libCat == undefined) {
                    cas = 9;
                    response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionArticlesCategories');
                }
                else {
                    // On supprime les liens entre cette catégorie et les différents articles
                    avoircategorie.supprimerLienCatégoriesArticle(numCat, (next) => {
                        Catégorie.supprimerCatégorie(numCat, (cb) => {
                            // On le supprime, et on indique qu'on l'a bien supprimé sur la page
                            var cas = 3;
                            response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                            response.redirect('/EspaceAdmin/GestionArticlesCategories');
                        });
                    });
                }
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
                // on vérifie que la catégorie existe
                if (libCat == undefined) {
                    cas = 9;
                    response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionArticlesCategories');
                }
                else {
                    response.render('pages/admin/modifierCatégorie', { cas: cas, libCat: libCat, numCat: numCat });
                }
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
            uploadHandler(request, response, (err) => {
                if (err) throw err;
                else {
                    var titreArticle = request.body.TitreArticle;
                    var texteArticle = request.body.texteArticle;
                    var catégories = request.body.Categories;
                    var images = request.files
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
                                    image.ajoutImage(images[i].path, (numImg) => {
                                        avoirImage.ajoutAvoirImage(numImg, numArticle, (cb) => { });
                                    });
                                }
                            });
                            // On indique que c'est un succès, on a pas besoin d'attendre la fin des créations pour l'afficher
                            response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie3')
                        }
                        else {
                            // On supprime les images qui viennent d'être upload
                            for (var i = 0; i < images.length; i++) {
                                // Il faudra supprimer du cloud
                            }
                            // Sinon on affiche le cas d'erreur
                            response.cookie('gestionAC', { titreArticle: titreArticle, texteArticle: texteArticle, cas: cas }, { expiresIn: '5s' });
                            response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie3');
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
exports.modifierArticle = (request, response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    var cas = 8;
    if (request.cookies.gestionModifA != undefined) {
        // On récupère toutes les valeurs
        cas = request.cookies.gestionModifA.cas;
    }
    // Puis on le supprime
    // Il s'expirera par lui même sinon
    response.clearCookie('gestionModifA', request.cookies.gestionModifA);
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère les infos nécessaires à afficher (article, images et catégories)
            article.avoirArticle(numArticle, (art) => {
                // On vérifie que l'article existe
                if (art[0] == undefined) {
                    cas = 9;
                    response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionArticlesCategories');
                }
                else {
                    article.avoirLibelléUnArticle(art[0].NumArticle, (catégories) => {
                        avoirImage.avoirLienImagesArticle(numArticle, (Img) => {
                            // Affiche toutes les catégories existantes
                            Catégorie.avoirNomCatégories((libCat) => {
                                response.render('pages/admin/modifierArticle', { article: art, catégories: catégories, cas: cas, Img: Img, libCat: libCat });
                            });
                        });
                    });
                }
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer la catégorie d'un article
exports.supprimerCatégorieArticle = (request, response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    var numCatégorie = request.params.numCategorie;
    var cas = 10;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            article.avoirArticle(numArticle, (art) => {
                avoircategorie.vérifArticleCatégorie(numArticle, numCatégorie, (tot) => {
                    // On vérifie que le lien entre l'article et la catégorie existe
                    if (art[0] == undefined || tot == 0) {
                        cas = 9;
                        response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                        response.redirect('/EspaceAdmin/GestionArticlesCategories');
                    }
                    else {
                        // On enlève le lien avec catégorie en question 
                        avoircategorie.supprimerCatégorieArticle(numArticle, numCatégorie, (nbAffect) => {
                            cas = 1;
                            // On renvoie que c'est bien un succès
                            response.cookie('gestionModifA', { cas: cas }, { expiresIn: '5s' });
                            var link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                            response.redirect(link);
                        });
                    }
                });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer une image d'un article
exports.supprimerImageArticle = (request, response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    var numImage = request.params.numImage;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On vérifie que l'article existe
            article.avoirArticle(numArticle, (art) => {
                avoirImage.vérifArticleImage(numArticle, numImage, (tot) => {
                    // On vérifie que le lien entre l'article et l'image existe
                    if (art[0] == undefined || tot == 0) {
                        cas = 9;
                        response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                        response.redirect('/EspaceAdmin/GestionArticlesCategories');
                    }
                    else {
                        // On supprime le lien image article
                        avoirImage.supprimerLienImageArticle(numArticle, numImage, (cb) => {
                            // Puis on supprime l'image du serveur
                            image.supprimerImage(numImage, (cb) => {
                                cas = 2;
                                response.cookie('gestionModifA', { cas: cas }, { expiresIn: '5s' });
                                var link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                                response.redirect(link);
                            });
                        });
                    }
                });
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de supprimer un article (et avec, ses images)
exports.supprimerArticle = (request, response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            article.avoirArticle(numArticle, (art) => {
                // On vérifie que l'article existe
                if (art[0] == undefined) {
                    cas = 9;
                    response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                    response.redirect('/EspaceAdmin/GestionArticlesCategories');
                }
                else {
                    // On supprime également les images du serveur, par contre on garde les catégories intactes
                    avoirImage.avoirImagesArticle(numArticle, (numsImg) => {
                        // On supprime les liens entre images/article
                        avoirImage.supprimerLienImagesArticle(numArticle, (next1) => {
                            // On supprime les liens catégories/article
                            avoircategorie.supprimerCatégoriesArticle(numArticle, (next2) => {
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
            });
        }
        else {
            response.redirect('/Connexion');
        }
    });
}

// Permet de modifier un article
exports.modifierArticleAction = (request, response) => {
    var token = request.cookies.token;
    var numArticle = request.params.numArticle;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            uploadHandler(request, response, (err) => {
                if (err) {
                    response.redirect('/Accueil');
                }
                else {
                    var titreArticle = request.body.TitreArticle;
                    var texteArticle = request.body.texteArticle;
                    var catégories = request.body.Categories;
                    var images = request.files
                    // On récupère le cas d'erreur s'il y en a un
                    casErreur.casErreurModifArticle(numArticle, titreArticle, texteArticle, catégories, (cas) => {
                        // Tout va bien, on modifie l'article
                        if (cas == 6 || cas == 7) {
                            response.cookie('infoA', { cas: cas }, { expiresIn: '5s' });
                            // On update le titre et le texte
                            article.modifierArticle(titreArticle, texteArticle, numArticle, (cb) => {
                                // On ajoute les nouveaux liens de catégories s'il y en a
                                if (cas == 7) {
                                    avoircategorie.ajoutUnLienArticleCatégorie(catégories, numArticle, (next) => { });
                                }
                                // Ajout des liens des images en BDD avec les lien image/article s'il y en a
                                for (var i = 0; i < images.length; i++) {
                                    image.ajoutImage(images[i].path, (numImg) => {
                                        avoirImage.ajoutAvoirImage(numImg, numArticle, (cb) => { });
                                    });
                                }
                            });
                            // On indique que c'est un succès, on a pas besoin d'attendre la fin des modifications pour l'afficher
                            response.redirect('/Accueil')
                        }
                        else {
                            // Sinon on affiche le cas d'erreur
                            response.cookie('gestionModifA', { titreArticle: titreArticle, texteArticle: texteArticle, cas: cas }, { expiresIn: '5s' });
                            // On supprime les images qui viennent d'être upload
                            if (images != undefined) {
                                for (var i = 0; i < images.length; i++) {
                                }
                            }
                            var link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                            response.redirect(link);
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