var connection = require('../config/db');

class Image {

    // Fonction permettant de récupérer les noms des images
    static liensImage(cb) {
        var query = connection.query('SELECT LienImage FROM image', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'ajouter le lien d'une image dans la BDD
    static ajoutImage(LienImage, cb) {
        var query = connection.query('INSERT INTO image SET LienImage = ?', LienImage, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }
}

module.exports = Image;