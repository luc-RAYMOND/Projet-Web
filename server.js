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

// Tout ce qui est hors connexion

projet.use('/', horsConnexionRoute);
projet.use('/Accueil', accueilPage);
projet.use('/Services', servicesPage);
projet.use('/Categories', catégoriesPage);


// On indique le port que l'on va utiliser
projet.listen(8080);