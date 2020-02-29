var connection = require('../config/db');

class avoirImage {

    // Fonction permettant de relier un article à une image
    static ajoutAvoirImage(numImage, numArt, cb) {
        var avoirImg = { NumImage: numImage, NumArticle: numArt };
        var query = connection.query('INSERT INTO avoirimage SET ?', avoirImg, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'avoir les images d'un article
    static avoirImagesArticle(numArt, cb) {
        var query = connection.query('SELECT NumImage FROM avoirimage WHERE NumArticle = ?', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer le lien entre une image et un article
    static supprimerLienImageArticle(numArt, cb) {
        var query = connection.query('DELETE FROM avoirimage WHERE NumArticle = ?', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = avoirImage;