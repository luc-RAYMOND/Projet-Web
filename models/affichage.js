// Ce model permet d'utiliser les fonctions des autres models pour gérer l'affichage dans l'html
var Catégorie = require('../models/categorie');
var Article = require('../models/article');
var moment = require('moment');

// Fonction qui permet de définir la langue locale de la date en français
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
    // In case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example).
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
    // },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4  // Used to determine first week of the year.
    }
});

// On utilise les fonctions faisant appel à la BDD pour afficher les catégories
// Cette variable permet de remplir les catégories à chaque fois qu'on charge une page
exports.remplirCatégorie = (req, res, next) => {
    Catégorie.avoirNomCatégories((nom) => {
        var contient = [];
        var compteur1 = 0;
        Catégorie.avoirNombresCatégories(nom, (num) => {
            // On remplie le tableau des valeurs
            contient[compteur1] = { nom: nom[compteur1].LibelléCatégorie, num: num[0].ite, numCat: nom[compteur1].NumCatégorie };
            compteur1++;
            if (compteur1 == nom.length) {
                // On fait un tri bulle ici permettant d'avoir en premier les catégories avec le plus d'articles d'abord
                for (var k = contient.length; k > 0; k--) {
                    for (var j = 0; j < k - 1; j++) {
                        if (contient[j + 1].num > contient[j].num) {
                            var intermediaire = contient[j];
                            contient[j] = contient[j + 1];
                            contient[j + 1] = intermediaire;
                        }
                    }
                }
                next(contient);
            }
        });
    });
}

exports.remplirArticle = (req, res, contient, next) => {
    // Va contenir tous les articles
    var articles = [];
    Article.avoirArticles((art) => {
        var compteur2 = 0;
        var compteur3 = 0;
        // On rentre les valeurs dans l'article correspondant
        for (var i = 0; i < art.length; i++) {
            articles[i] =
            {
                NumArticle: art[i].NumArticle,
                TitreArticle: art[i].TitreArticle,
                DateArticle: moment(art[i].DateArticle).format("dddd DD MMMM YYYY"),
                TexteArticle: art[i].TexteArticle,
            };
        }
        next(articles);
    });
}

exports.remplirArticleCatégorie = (req, res, contient, NumCatégorie, next) => {
    // Va contenir tous les articles
    var articles = [];
    Article.avoirArticlesCatégorie(NumCatégorie, (art) => {
        var compteur2 = 0;
        var compteur3 = 0;
        // On rentre les valeurs dans l'article correspondant
        for (var i = 0; i < art.length; i++) {
            articles[i] =
            {
                NumArticle: art[i].NumArticle,
                TitreArticle: art[i].TitreArticle,
                DateArticle: moment(art[i].DateArticle).format("dddd DD MMMM YYYY"),
                TexteArticle: art[i].TexteArticle,
            };
        }
        next(articles);
    });
}

exports.remplirCatégorieArticle = (req, res, contient, articles, next) => {
    // Va contenir les catégories de chaque article
    var cat = [];
    var compteur2 = 0;
    compteur2 = 0;
    // On remplie les valeurs des libellés de catégorie
    Article.avoirLibellé(articles, (libCat) => {
        cat[compteur2] = libCat;
        compteur2++;
        if (compteur2 == articles.length) {
            next(cat);
        }
    });
}
exports.remplirImageArticle = (req, res, contient, articles, cat, next) => {
    // Va contenir le lien des images de chaque article
    var img = [];
    var compteur3 = 0;
    compteur3 = 0;
    // On remplie les valeurs des libellés de catégorie
    Article.avoirImage(articles, (lienImg) => {
        img[compteur3] = lienImg;
        compteur3++;
        if (compteur3 == articles.length) {
            next(img);
        }
    });
}