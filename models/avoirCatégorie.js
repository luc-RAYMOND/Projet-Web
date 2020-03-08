const connection = require('../config/db');
const Catégorie = require('../models/categorie')

class avoirCatégorie {

    // Fonction permettant de créer un lien entre un article et des catégories
    static ajoutUnLienArticleCatégorie(categories, NumArticle, cb) {
        // On regarde s'il y a plusieurs catégories
        if (categories[0].length == 1) {
            // Il n'y a qu'une seule catégorie
            // On sait qu'elle existe, on récupère le numéro de catégorie
            Catégorie.vérifierLibellé(categories, (NumCatégorie) => {
                let avoircat = { NumArticle: NumArticle, NumCatégorie: NumCatégorie[0].NumCatégorie }
                let query = connection.query('INSERT INTO avoircatégorie SET ?', avoircat, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            })

        }
        else {
            // C'est un tableau de catégories
            for (let i = 0; i < categories.length; i++) {
                Catégorie.vérifierLibellé(categories[i], (NumCatégorie) => {
                    let avoircat = { NumArticle: NumArticle, NumCatégorie: NumCatégorie[0].NumCatégorie }
                    let query = connection.query('INSERT INTO avoircatégorie SET ?', avoircat, (error, results) => {
                        if (error) throw error;
                        cb(results);
                    });
                });
            }
        }
    }

    // Permet de supprimer tous les liens entre un article et ses catégories
    static supprimerCatégoriesArticle(numArt, cb) {
        let query = connection.query('DELETE FROM avoircatégorie WHERE NumArticle = ?', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de supprimer tous les liens entre une catégorie et ses articles
    static supprimerLienCatégoriesArticle(NumCatégorie, cb) {
        let query = connection.query('DELETE FROM avoircatégorie WHERE NumCatégorie = ?', NumCatégorie, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de supprimer un lien entre un article et une catégorie
    static supprimerCatégorieArticle(numArt, numCat, nb) {
        let query = connection.query('DELETE FROM avoircatégorie WHERE NumArticle = ? AND NumCatégorie = ?', [numArt, numCat], (error, results) => {
            if (error) throw error;
            nb(results.affectedRows);
        });
    }

    // Permet de vérifier qu'il y a bien un lien entre cet article et cette catégorie
    static vérifArticleCatégorie(numArt, numCat, nb) {
        let query = connection.query('SELECT COUNT(*) as tot FROM avoircatégorie WHERE NumArticle = ? AND NumCatégorie = ?', [numArt, numCat], (error, results) => {
            if (error) throw error;
            nb(results[0].tot);
        });
    }
}

module.exports = avoirCatégorie;