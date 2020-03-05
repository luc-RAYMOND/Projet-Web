var connection = require('../config/db');

class Categorie {

    // Fonction permattant d'avoir le libellé et le numéro de chaque catégorie
    static avoirNomCatégories(cb) {
        var query = connection.query('SELECT NumCatégorie,LibelléCatégorie FROM catégorie', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permattant d'avoir le libellé si on a le numéro
    static avoirLibellé(num, cb) {
        var query = connection.query('SELECT LibelléCatégorie FROM catégorie WHERE NumCatégorie = ?', num, (error, results) => {
            if (error) throw error;
            cb(results[0]);
        });
    }

    // Fonction permettant d'avoir le nombre d'articles par catégorie
    static avoirNombresCatégories(results, cb) {
        if (results[0] != undefined) {
            for (var i = 0; i < results.length; i++) {
                var query = connection.query('SELECT count(*) as ite FROM avoircatégorie WHERE NumCatégorie = ?', results[i].NumCatégorie, (error, results2) => {
                    if (error) throw error;
                    cb(results2);
                });
            }
        }
        else {
            cb(results);
        }
    }

    // Fonction permettant de vérifier s'il existe une catégorie avec le libellé en paramètre
    static vérifierLibellé(lib, cb) {
        var query = connection.query('SELECT NumCatégorie,LibelléCatégorie FROM catégorie WHERE LibelléCatégorie = ?', lib, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de vérifier qu'une catégorie existe avec son numéro
    static vérifierNumCatégorie(num, cb) {
        var query = connection.query('SELECT COUNT(*) as tot FROM catégorie WHERE NumCatégorie = ?', num, (error, results) => {
            if (error) throw error;
            cb(results[0].tot);
        });
    }

    // Fonction permettant d'ajouter une catégorie
    static ajouterCatégorie(lib, cb) {
        var query = connection.query('INSERT INTO catégorie SET Libellécatégorie = ?', lib, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer une catégorie
    static supprimerCatégorie(num, cb) {
        var query = connection.query('DELETE FROM catégorie WHERE NumCatégorie = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de modifier une catégorie
    static modifierCatégorie(libCat, num, cb) {
        var query = connection.query('UPDATE catégorie SET LibelléCatégorie = ? WHERE NumCatégorie = ?', [libCat, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Categorie;