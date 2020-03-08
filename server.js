// On importe la librairie express et on crée le serveur projet
const express = require('express');
const projet = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Pour pouvoir récupérer le contenu body des requêtes POST et les cookies
projet.use(bodyParser.urlencoded({ extended: false }));
projet.use(bodyParser.json());
projet.use(cookieParser())

// On utilise le module ejs pour lire l'html
projet.set('view engine', 'ejs');

// On indique dans quel dossier il faut aller chercher les fichiers statiques (tout ce qui est css) 
projet.use(express.static('public'));

// On importe les fichiers routes
const commonRoute = require('./routes/commonRoute');
const accueilPage = require('./routes/accueilRoute');
const servicesPage = require('./routes/servicesRoute');
const catégoriesPage = require('./routes/catégoriesRoute');
const livreOr = require('./routes/livreOrRoute');
const espaceClient = require('./routes/espaceClientRoute');
const espaceAdmin = require('./routes/espaceAdminRoute');
const gestionArticlesCategories = require('./routes/gestionArticlesCategoriesRoute');
const gestionDevis = require('./routes/gestionDevisRoute');

// Tout ce qui est hors connexion

projet.use('/', commonRoute);
projet.use('/Accueil', accueilPage);
projet.use('/Services', servicesPage);
projet.use('/Categories', catégoriesPage);
projet.use('/LivreOr', livreOr);
projet.use('/EspaceClient', espaceClient);
projet.use('/EspaceAdmin', espaceAdmin);
projet.use('/EspaceAdmin/GestionArticlesCategories', gestionArticlesCategories);
projet.use('/EspaceAdmin/GestionDevis', gestionDevis);

// Notre route lorsque l'on n'est pas sur une page existante
projet.use(function (req, res, next) {
    res.status(404).render('pages/common/404notfound');
});

// On indique le port que l'on va utiliser
const PORT = process.env.PORT || 8080;
projet.listen(PORT);