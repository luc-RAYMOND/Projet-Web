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
}

module.exports = avoirImage;