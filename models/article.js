var connection = require('../config/db');

class Article {

    // Fonction permettant de récupérer tous les articles, avec les plus récents d'abord
    static avoirArticles(cb) {
        var query = connection.query('SELECT * FROM article ORDER BY DateArticle DESC', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant les articles d'une catégorie à partir du numéro de catégorie
    static avoirArticlesCatégorie(num, cb) {
        var query = connection.query('SELECT article.NumArticle,TitreArticle,DateArticle,TexteArticle FROM article,avoircatégorie,catégorie WHERE catégorie.NumCatégorie = ? AND article.NumArticle = avoircatégorie.NumArticle AND avoircatégorie.NumCatégorie = catégorie.NumCatégorie ORDER BY DateArticle DESC', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les catégories d'un article
    static avoirLibellé(num, cb) {
        for (var i = 0; i < num.length; i++) {
            var query = connection.query('SELECT LibelléCatégorie FROM article,catégorie,avoircatégorie WHERE article.NumArticle = ? AND article.NumArticle = avoircatégorie.NumArticle AND avoircatégorie.NumCatégorie = catégorie.NumCatégorie', num[i].NumArticle, (error, results) => {
                if (error) throw error;
                cb(results);
            });
        }

    }

    // Fonction permettant de récupérer les images d'un article
    static avoirImage(num, cb) {
        for (var i = 0; i < num.length; i++) {
            var query = connection.query('SELECT LienImage FROM article,image,avoirimage WHERE article.NumArticle = ? AND article.NumArticle = avoirimage.NumArticle AND avoirimage.NumImage=image.NumImage', num[i].NumArticle, (error, results) => {
                if (error) throw error;
                cb(results);
            });
        }
    }

}

module.exports = Article;