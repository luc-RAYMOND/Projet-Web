// Ce model permet d'utiliser les fonctions des autres models pour envoyer des données
// qu'on affiche dans l'html
const Catégorie = require('../models/categorie');
const Article = require('../models/article');
const utilisateur = require('../models/utilisateur');
const avoirDevis = require('../models/avoirDevis');
const avoirLC = require('../models/avoirLC');
const moment = require('moment');

// Fonction qui permet de définir la langue locale de la date en français (provenant du module 'moment')
moment.locale('fr', {
    months: 'Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Août_Septembre_Octobre_Novembre_Décembre'.split('_'),
    monthsShort: 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
    monthsParseExact: true,
    weekdays: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
    weekdaysShort: 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
    weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd D MMMM YYYY HH:mm'
    },
    calendar: {
        sameDay: '[Aujourd’hui à] LT',
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [dernier à] LT',
        sameElse: 'L'
    },
    relativeTime: {
        future: 'dans %s',
        past: 'il y a %s',
        s: 'quelques secondes',
        m: 'une minute',
        mm: '%d minutes',
        h: 'une heure',
        hh: '%d heures',
        d: 'un jour',
        dd: '%d jours',
        M: 'un mois',
        MM: '%d mois',
        y: 'un an',
        yy: '%d ans'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
    ordinal: function (number) {
        return number + (number === 1 ? 'er' : 'e');
    },
    meridiemParse: /PD|MD/,
    isPM: function (input) {
        return input.charAt(0) === 'M';
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week: {
        dow: 1,
        doy: 4
    }
});

// On utilise les fonctions faisant appel à la BDD pour afficher les catégories
// Cette variable permet de remplir les catégories à chaque fois qu'on charge une page
exports.remplirCatégorie = (next) => {
    Catégorie.avoirNomCatégories((nom) => {
        // Va contenir les id des différentes catégories
        let cat = [];
        let contient = [];
        for (let i = 0; i < nom.length; i++) {
            cat[i] = nom[i].NumCatégorie;
        }
        // On récupère pour chaque article les catégories
        const promises = cat.map((num) => Catégorie.avoirNombresCatégories([num]));
        Promise.all(promises).then((num) => {
            contient = num;
            // On fait un tri bulle ici permettant d'avoir en premier les catégories avec le plus d'articles d'abord
            for (let k = num.length; k > 0; k--) {
                for (let j = 0; j < k - 1; j++) {
                    if (contient[j + 1][0].ite > contient[j][0].ite) {
                        let intermediaire = contient[j];
                        contient[j] = contient[j + 1];
                        contient[j + 1] = intermediaire;
                    }
                }
            }
            next(contient);
        });
    });
}

// Permet de récupérer les infos des articles
exports.remplirArticle = (next) => {
    // Va contenir tous les articles
    let articles = [];
    Article.avoirArticles((art) => {
        // On rentre les valeurs dans l'article correspondant
        for (let i = 0; i < art.length; i++) {
            articles[i] =
            {
                NumArticle: art[i].NumArticle,
                TitreArticle: art[i].TitreArticle,
                DateArticle: moment(art[i].DateArticle).format("dddd DD MMMM YYYY, HH:mm"),
                TexteArticle: art[i].TexteArticle,
            };
        }
        next(articles);
    });
}

// On remplie les articles faisant partie de la catégorie en paramètre
exports.remplirArticleCatégorie = (NumCatégorie, next) => {
    // Va contenir tous les articles
    let articles = [];
    Article.avoirArticlesCatégorie(NumCatégorie, (art) => {
        // On rentre les valeurs dans l'article correspondant
        for (let i = 0; i < art.length; i++) {
            articles[i] =
            {
                NumArticle: art[i].NumArticle,
                TitreArticle: art[i].TitreArticle,
                DateArticle: moment(art[i].DateArticle).format("dddd DD MMMM YYYY, HH:mm"),
                TexteArticle: art[i].TexteArticle,
            };
        }
        next(articles);
    });
}

// Permet d'avoir les catégories de chaque article
exports.remplirCatégorieArticle = (articles, next) => {
    // Va contenir les id des différents articles
    let art = [];
    for (let i = 0; i < articles.length; i++) {
        art[i] = articles[i].NumArticle;
    }
    // On récupère pour chaque article les catégories
    const promises = art.map((libCat) => Article.avoirLibellé([libCat]));
    Promise.all(promises).then((libCat) => {
        next(libCat);
    });
}

// Permet d'avoir les images de chaque article
exports.remplirImageArticle = (articles, next) => {
    // Va contenir les id des articles
    let art = [];
    for (let i = 0; i < articles.length; i++) {
        art[i] = articles[i].NumArticle;
    }
    // On récupère pour chaque article les images
    const promises = art.map((lienImg) => Article.avoirImage([lienImg]));
    Promise.all(promises).then((lienImg) => {
        next(lienImg);
    });
}

// Nous permet d'avoir les pseudos de ceux ayant posté dans le livre d'or
exports.avoirPseudos = (avis, next) => {
    // Va contenir les id des utilisateurs ayant posté
    let avisLO = [];
    for (let i = 0; i < avis.length; i++) {
        avisLO[i] = avis[i].NumUtilisateur;
    }
    // On récupère pour chaque article les images
    const promises = avisLO.map((pseudos) => utilisateur.avoirPseudo([pseudos]));
    Promise.all(promises).then((pseudos) => {
        next(pseudos)
    });
}

// Permet d'avoir les utilisateurs des devis
exports.avoirUtilisateursDevis = (devisClients, next) => {
    // Va contenir les utilisateurs pour chaque devis
    let devis = [];
    for (let i = 0; i < devisClients.length; i++) {
        devis[i] = devisClients[i].NumDevis;
    }
    const promises = devis.map((utilisateur) => avoirDevis.avoirUtilisateurDevis([utilisateur]));
    Promise.all(promises).then((utilisateur) => {
        next(utilisateur);
    });
}

// Fonction permettant de calculer les montants des devis
exports.montantDevis = (devisClients, next) => {
    if (devisClients[0] == undefined) {
        next(devisClients);
    }
    else {
        // Va contenir les lignes de commande de chaque devis
        let LC = [];
        // Va contenir le montant de chaque devis
        let montant = [];
        for (let i = 0; i < devisClients.length; i++) {
            LC[i] = devisClients[i].NumDevis;
        }
        // On récupère toutes les lignes de commande
        const promises = LC.map((lignesCommande) => avoirLC.avoirlignesCommandesDevis([lignesCommande]));
        Promise.all(promises).then((lignesCommande) => {
            // On calcule le montant de chaque devis
            for (let i = 0; i < devisClients.length; i++) {
                let montantDevis = 0;
                for (let j = 0; j < lignesCommande[i].length; j++) {
                    montantDevis += lignesCommande[i][j].PrixTarifUnitaire * lignesCommande[i][j].Quantité;
                }
                montant[i] = montantDevis.toFixed(2);
            }
            next(montant)
        });
    }
}