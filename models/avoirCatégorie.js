var connection = require('../config/db');
var Catégorie = require('../models/categorie')

class avoirCatégorie {

    // Fonction permettant de créer un lien entre un article et des catégories
    static ajoutUnLienArticleCatégorie(categories, NumArticle, cb) {
        var length = 1;
        // On regarde s'il y a plusieurs catégories
        if (categories[0].length == 1) {
            // Il n'y a qu'une seule catégorie
            // On sait qu'elle existe, on récupère le numéro de catégorie
            Catégorie.vérifierLibellé(categories, (NumCatégorie) => {
                var avoircat = { NumArticle: NumArticle, NumCatégorie: NumCatégorie[0].NumCatégorie }
                var query = connection.query('INSERT INTO avoircatégorie SET ?', avoircat, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            })

        }
        else {
            // C'est un tableau de catégories, on récupère donc sa longueur
            length = categories.length;
            for (var i = 0; i < categories.length; i++) {
                Catégorie.vérifierLibellé(categories[i], (NumCatégorie) => {
                    var avoircat = { NumArticle: NumArticle, NumCatégorie: NumCatégorie[0].NumCatégorie }
                    var query = connection.query('INSERT INTO avoircatégorie SET ?', avoircat, (error, results) => {
                        if (error) throw error;
                        cb(results);
                    });
                });
            }
        }
    }

    // Permet de supprimer tous les liens entre un article et ses catégories
    static supprimerCatégorieArticle(numArt, cb) {
        var query = connection.query('DELETE FROM avoircatégorie WHERE NumArticle = ?', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de supprimer un lien entre un article et une catégorie
    static supprimerCatégorieArticle(numArt, numCat, nb) {
        var query = connection.query('DELETE FROM avoircatégorie WHERE NumArticle = ? AND NumCatégorie = ?', [numArt, numCat], (error, results) => {
            if (error) throw error;
            nb(results.affectedRows);
        });
    }
}

module.exports = avoirCatégorie;