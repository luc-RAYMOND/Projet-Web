// Les models d'où viennent les fonctions sur la BDD
const verifConnexion = require('../models/verifConnexion');
const casErreur = require('../models/casErreur');
const Catégorie = require('../models/categorie')
const article = require('../models/article');
const image = require('../models/image');
const avoirImage = require('../models/avoirImage');
const avoircategorie = require('../models/avoirCatégorie');

// Va nous permettre de gérer l'upload d'image
const multer = require('multer');
const multerGoogleStorage = require('multer-google-storage');

// Nous permet d'upload les images sur le cloud
let uploadHandler = multer({
    storage: multerGoogleStorage.storageEngine({
        keyFilename: "./sonic-ego-270221-523d55cbcddb.json",
        projectId: 'sonic-ego-270221',
        bucket: 'atelier-alegolas91'
    })
}).array('images', 10);

// Permet d'accéder à la page de gestion des articles et catégories
exports.gestionArticlesCatégories = (request, response) => {
    let token = request.cookies.token;
    let cas = 10;
    let titreArticle = '';
    let texteArticle = '';
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
                // On indique que l'accès est interdit
                if (admin == 10) {
                    response.cookie('access', { err: true }, { expiresIn: '5s' });
                    response.redirect('/Connexion');
                }
                else {
                    response.cookie('access', { err: true }, { expiresIn: '5s' })
                    response.redirect('/Accueil');
                }
            }
        });
    });
}

exports.ajoutCatégorie = (request, response) => {
    let token = request.cookies.token;
    // On récupère le libellé entré
    let libCat = request.body.libCat;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            // On récupère le cas d'erreur ou de succès
            casErreur.casAjoutCatégorie(libCat, (cas) => {
                response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                // On peut l'insérer dans la BDD
                if (cas == 2) {
                    Catégorie.ajouterCatégorie(libCat, (cb) => {
                        response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie1');
                    });
                }
                else {
                    response.redirect('/EspaceAdmin/GestionArticlesCategories#Partie1');
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de supprimer une catégorie
exports.supprimerCatégorie = (request, response) => {
    let numCat = request.params.numCat;
    let token = request.cookies.token;
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
                            let cas = 3;
                            response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                            response.redirect('/EspaceAdmin/GestionArticlesCategories');
                        });
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet d'accéder à la page de modification d'une catégorie
exports.modifierCatégoriePage = (request, response) => {
    let numCat = request.params.numCat;
    let token = request.cookies.token;
    let cas = 10;
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
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de modifier la catégorie
exports.modifierCatégorie = (request, response) => {
    let numCat = request.params.numCat;
    let libCat = request.body.libCat;
    let token = request.cookies.token;
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
                    let link = '/EspaceAdmin/GestionArticlesCategories/' + numCat + '/ModifierCategorie';
                    response.redirect(link)
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet d'ajouter un article
exports.ajoutArticle = (request, response) => {
    let token = request.cookies.token;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            uploadHandler(request, response, (err) => {
                if (err) {
                    response.status(500).render('pages/common/errServ');
                }
                else {
                    let titreArticle = request.body.TitreArticle;
                    let texteArticle = request.body.texteArticle;
                    let catégories = request.body.Categories;
                    let images = request.files
                    // On récupère le cas d'erreur s'il y en a un
                    casErreur.casErreurAjoutArticle(titreArticle, texteArticle, catégories, (cas) => {
                        // Tout va bien, on crée l'article
                        if (cas == 8) {
                            response.cookie('gestionAC', { cas: cas }, { expiresIn: '5s' });
                            article.ajoutArticle(titreArticle, texteArticle, (numArticle) => {
                                // Ainsi que les liens avec les catégories
                                avoircategorie.ajoutUnLienArticleCatégorie(catégories, numArticle, (next) => { });
                                // Ajout des liens des images en BDD avec les lien image/article
                                for (let i = 0; i < images.length; i++) {
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
                            for (let i = 0; i < images.length; i++) {
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
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de charger la page contenant l'article que l'on veut modifier
exports.modifierArticle = (request, response) => {
    let token = request.cookies.token;
    let numArticle = request.params.numArticle;
    let cas = 8;
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
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de supprimer la catégorie d'un article
exports.supprimerCatégorieArticle = (request, response) => {
    let token = request.cookies.token;
    let numArticle = request.params.numArticle;
    let numCatégorie = request.params.numCategorie;
    let cas = 10;
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
                            let link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                            response.redirect(link);
                        });
                    }
                });
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de supprimer une image d'un article
exports.supprimerImageArticle = (request, response) => {
    let token = request.cookies.token;
    let numArticle = request.params.numArticle;
    let numImage = request.params.numImage;
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
                                let link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                                response.redirect(link);
                            });
                        });
                    }
                });
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de supprimer un article (et avec, ses images)
exports.supprimerArticle = (request, response) => {
    let token = request.cookies.token;
    let numArticle = request.params.numArticle;
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
                                        let cas = 1;
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
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}

// Permet de modifier un article
exports.modifierArticleAction = (request, response) => {
    let token = request.cookies.token;
    let numArticle = request.params.numArticle;
    verifConnexion.verifConnexion(token, (admin) => {
        if (admin == 1) {
            uploadHandler(request, response, (err) => {
                if (err) {
                    response.redirect('/Accueil');
                }
                else {
                    let titreArticle = request.body.TitreArticle;
                    let texteArticle = request.body.texteArticle;
                    let catégories = request.body.Categories;
                    let images = request.files
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
                                for (let i = 0; i < images.length; i++) {
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
                                for (let i = 0; i < images.length; i++) {
                                }
                            }
                            let link = '/EspaceAdmin/GestionArticlesCategories/' + numArticle + '/ModifierArticle';
                            response.redirect(link);
                        }
                    });
                }
            });
        }
        else {
            // On indique que l'accès est interdit
            if (admin == 10) {
                response.cookie('access', { err: true }, { expiresIn: '5s' });
                response.redirect('/Connexion');
            }
            else {
                response.cookie('access', { err: true }, { expiresIn: '5s' })
                response.redirect('/Accueil');
            }
        }
    });
}