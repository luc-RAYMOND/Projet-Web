var connection = require('../config/db');

class Article {

    // Fonction permettant de récupérer tous les articles, avec les plus récents d'abord
    static avoirArticles(cb) {
        var query = connection.query('SELECT * FROM article ORDER BY DateArticle DESC', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer un article avec son numéro
    static avoirArticle(NumArticle, cb) {
        var query = connection.query('SELECT NumArticle,TitreArticle,TexteArticle FROM article WHERE NumArticle = ?', NumArticle, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupèrer les articles d'une catégorie à partir du numéro de catégorie
    static avoirArticlesCatégorie(num, cb) {
        var query = connection.query('SELECT article.NumArticle,TitreArticle,DateArticle,TexteArticle FROM article,avoircatégorie,catégorie WHERE catégorie.NumCatégorie = ? AND article.NumArticle = avoircatégorie.NumArticle AND avoircatégorie.NumCatégorie = catégorie.NumCatégorie ORDER BY DateArticle DESC', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les catégories d'un article pour plusieurs articles
    static avoirLibellé(num, cb) {
        if (num[0] != undefined) {
            for (var i = 0; i < num.length; i++) {
                var query = connection.query('SELECT Catégorie.NumCatégorie,LibelléCatégorie FROM article,catégorie,avoircatégorie WHERE article.NumArticle = ? AND article.NumArticle = avoircatégorie.NumArticle AND avoircatégorie.NumCatégorie = catégorie.NumCatégorie', num[i].NumArticle, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            }
        }
        else {
            cb(num);
        }
    }

    // Fonction permettant de récupérer les catégories d'un article
    static avoirLibelléUnArticle(num, cb) {
        var query = connection.query('SELECT Catégorie.NumCatégorie,LibelléCatégorie FROM article,catégorie,avoircatégorie WHERE article.NumArticle = ? AND article.NumArticle = avoircatégorie.NumArticle AND avoircatégorie.NumCatégorie = catégorie.NumCatégorie', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les images d'un article
    static avoirImage(num, cb) {
        if (num[0] != undefined) {
            for (var i = 0; i < num.length; i++) {
                var query = connection.query('SELECT LienImage FROM article,image,avoirimage WHERE article.NumArticle = ? AND article.NumArticle = avoirimage.NumArticle AND avoirimage.NumImage=image.NumImage', num[i].NumArticle, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            }
        }
        else {
            cb(num);
        }
    }

    // Fonction permettant de créer un article
    static ajoutArticle(TitreArticle, TexteArticle, cb) {
        var article = { TitreArticle: TitreArticle, TexteArticle: TexteArticle, DateArticle: new Date() }
        var query = connection.query('INSERT INTO article SET ?', article, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant de supprimer un article
    static supprimerArticle(NumArticle, cb) {
        var query = connection.query('DELETE FROM article WHERE NumArticle = ?', NumArticle, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de modifier un article
    static modifierArticle(TitreArticle, TexteArticle, NumArticle, cb) {
        var query = connection.query('UPDATE article SET TitreArticle = ?, TexteArticle = ? WHERE NumArticle = ?', [TitreArticle, TexteArticle, NumArticle], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Article;