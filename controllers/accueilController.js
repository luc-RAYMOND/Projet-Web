// Les models d'où viennent les fonctions sur la BDD
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

// Tableau contenant les couples nom / nombre d'articles par catégorie
var contient = [];
var compteur1 = 0;
// On utilise les fonctions faisant appel à la BDD pour afficher les catégories
// Cette variable permet de remplir le tableau à chaque fois qu'on charge une page
var remplirCatégorie = () => {
    Catégorie.avoirNomCatégories((nom) => {
        compteur1 = 0;
        Catégorie.avoirNombresCatégories(nom, (num) => {
            // On remplie le tableau des valeurs
            contient[compteur1] = { nom: nom[compteur1].LibelléCatégorie, num: num[0].ite };
            compteur1++;
            if (compteur1 == nom.length) {
                // On fait un tri bulle ici permettant d'avoir en premier les catégories avec le plus d'articles
                for (var k = contient.length - 1; k > 0; k--) {
                    for (var j = 0; j < k - 1; j++) {
                        if (contient[j + 1].num > contient[j].num) {
                            var intermediaire = contient[j];
                            contient[j] = contient[j + 1];
                            contient[j + 1] = intermediaire;
                        }
                    }
                }
            }
        });
    });
}

// Va contenir tous les articles
var articles = [];
// Va contenir les catégories de chaque article
var cat = [];
// Va contenir le lien des images de chaque article
var img = [];
var compteur2 = 0;
var compteur3 = 0;
var remplirArticle = () => {
    Article.avoirArticles((art) => {
        // On rentre les valeurs dans l'article correspondant
        for (var i = 0; i < art.length; i++) {
            articles[i] =
            {
                TitreArticle: art[i].TitreArticle,
                DateArticle: moment(art[i].DateArticle).format("dddd DD MMMM YYYY"),
                TexteArticle: art[i].TexteArticle,
            };
        }
        compteur2 = 0;
        // On remplie les valeurs des libellé de catégorie
        Article.avoirLibellé(art, (libCat) => {
            cat[compteur2] = libCat;
            compteur2++;
        });
        compteur3 = 0;
        // On remplie les valeurs de lien d'image
        Article.avoirImage(art, (lienImg) => {
            img[compteur3] = lienImg;
            compteur3++;
        });
    });
}

remplirArticle();
remplirCatégorie();

// Une version coupée de nos tableaux, pour en afficher au maximum 5 par pages
var slicedArticles;
var slicedCat;
var slicedImg;
// Le nombre de pages max
var pageMax = Math.ceil(articles.length / 5);

// Cette fonction permet, selon la page sur laquelle on est, de coupé nos articles
// Et d'avoir le nombre de pages max
function pagination(Page) {
    var trimStart = (Page - 1) * 5;
    var trimEnd = trimStart + 5;
    slicedArticles = articles.slice(trimStart, trimEnd);
    slicedCat = cat.slice(trimStart, trimEnd);
    slicedImg = img.slice(trimStart, trimEnd);
    pageMax = Math.ceil(articles.length / 5);
}

// Permet de charger la page d'accueil
exports.accueil = (request, response) => {
    remplirCatégorie();
    remplirArticle();
    pagination(1);
    pageActuelle = 1;
    response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageMax: pageMax, pageActuelle: pageActuelle });
}

// Permet d'avoir les autres pages de la page d'accueil
exports.accueilPage = (request, response) => {
    remplirCatégorie();
    remplirArticle();
    // On récupère le numéro de la page demandée dans l'URL
    pageActuelle = request.params.numPage;
    pageMax = Math.ceil(articles.length / 5);
    // On vérifie la validité de l'entrée de l'URL
    if (parseInt(pageActuelle) == parseFloat(pageActuelle) && (pageActuelle >= 2 && pageActuelle <= pageMax)) {
        pagination(pageActuelle);
        response.render('pages/HC/accueilHC', { contient: contient, articles: slicedArticles, cat: slicedCat, img: slicedImg, pageMax: pageMax, pageActuelle: pageActuelle });
    }
    else {
        // Si URL non valide
        response.send("404 not found");
    }
}