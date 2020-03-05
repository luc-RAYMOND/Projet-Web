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

    // Fonction permettant d'avoir les liens des images d'un article
    static avoirLienImagesArticle(numArt, cb) {
        var query = connection.query('SELECT Image.NumImage,LienImage FROM avoirimage,image WHERE NumArticle = ? AND image.NumImage = avoirimage.NumImage', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }


    // Fonction permettant de supprimer les lien entre des images et un article
    static supprimerLienImagesArticle(numArt, cb) {
        var query = connection.query('DELETE FROM avoirimage WHERE NumArticle = ?', numArt, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer le lien entre une image et un article
    static supprimerLienImageArticle(numArt, numImage, cb) {
        var query = connection.query('DELETE FROM avoirimage WHERE NumArticle = ? AND NumImage = ?', [numArt, numImage], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de vérifier le lien entre un article et une image
    static vérifArticleImage(numArt, NumImage, nb) {
        var query = connection.query('SELECT COUNT(*) as tot FROM avoirImage WHERE NumArticle = ? AND NumImage = ?', [numArt, NumImage], (error, results) => {
            if (error) throw error;
            nb(results[0].tot);
        });
    }
}

module.exports = avoirImage;