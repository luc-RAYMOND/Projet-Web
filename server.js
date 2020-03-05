// On importe la librairie express et on crée le serveur projet
var express = require('express');
var projet = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')

// Pour pouvoir récupérer le contenu body des requêtes POST et les cookies
projet.use(bodyParser.urlencoded({ extended: false }));
projet.use(bodyParser.json());
projet.use(cookieParser())

// On utilise le module ejs pour lire l'html
projet.set('view engine', 'ejs');

// On indique dans quel dossier il faut aller chercher les fichiers statiques (tout ce qui est css) 
projet.use(express.static('public'));

// On importe les fichiers routes
var horsConnexionRoute = require('./routes/commonRoute');
var accueilPage = require('./routes/accueilRoute');
var servicesPage = require('./routes/servicesRoute');
var catégoriesPage = require('./routes/catégoriesRoute');
var livreOr = require('./routes/livreOrRoute');
var espaceClient = require('./routes/espaceClientRoute');
var espaceAdmin = require('./routes/espaceAdminRoute');
var gestionArticlesCategories = require('./routes/gestionArticlesCategoriesRoute');
var gestionDevis = require('./routes/gestionDevisRoute');

// Tout ce qui est hors connexion

projet.use('/', (request,response) => {response.redirect('/Accueil')});
projet.use('/', horsConnexionRoute);
projet.use('/Accueil', accueilPage);
projet.use('/Services', servicesPage);
projet.use('/Categories', catégoriesPage);
projet.use('/LivreOr', livreOr);
projet.use('/EspaceClient', espaceClient);
projet.use('/EspaceAdmin', espaceAdmin);
projet.use('/EspaceAdmin/GestionArticlesCategories', gestionArticlesCategories);
projet.use('/EspaceAdmin/GestionDevis', gestionDevis);

// Notre route lorsque l'on n'est pas sur une page existante
projet.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Erreur 404 : Page introuvable !');
});

// On indique le port que l'on va utiliser
const PORT = process.env.PORT || 8080;
projet.listen(PORT);