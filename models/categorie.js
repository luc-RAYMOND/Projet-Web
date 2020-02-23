var connection = require('../config/db');

class Categorie {

    // Fonction permattant d'avoir le libellé et le numéro de chaque catégorie
    static avoirNomCatégories(cb) {
        var query = connection.query('SELECT NumCatégorie,LibelléCatégorie FROM catégorie', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'avoir le nombre d'articles par catégorie
    static avoirNombresCatégories(results, cb) {
        for (var i = 0; i < results.length; i++) {
            var query = connection.query('SELECT count(*) as ite FROM avoircatégorie WHERE NumCatégorie = ?', results[i].NumCatégorie, (error, results2) => {
                if (error) throw error;
                cb(results2);
            });
        }
    }
}

module.exports = Categorie;