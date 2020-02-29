var express = require('express');
var route = express.Router();

// On importe le controller
var GAC = require('../controllers/gestionArticlesCatégoriesController');

// Les différentes routes de la gestion des articles et des catégories
route.get('/', GAC.gestionArticlesCatégories);
route.post('/1', GAC.ajoutCatégorie);
route.post('/2', GAC.ajoutArticle);
route.get('/:numCat/SupprimerCategorie', GAC.supprimerCatégorie);
route.get('/:numCat/ModifierCategorie', GAC.modifierCatégoriePage);
route.post('/:numCat/ModifierCategorie', GAC.modifierCatégorie);
route.get('/:numArticle/SupprimerArticle', GAC.supprimerArticle);
route.get('/:numArticle/ModifierArticle', GAC.modifierArticle);
route.post('/:numArticle/ModifierArticle', GAC.modifierArticleAction);
route.get('/:numArticle/ModifierArticle/:numCategorie/SupprimerCategorieArticle', GAC.supprimerCatégorieArticle);
route.get('/:numArticle/ModifierArticle/:numImage/SupprimerImageArticle', GAC.supprimerImageArticle);

// On exporte nos routes
module.exports = route;