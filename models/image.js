const connection = require('../config/db');

class Image {

    // Fonction permettant de récupérer les noms des images
    static liensImage(cb) {
        let query = connection.query('SELECT LienImage FROM image', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer le nom d'une image
    static lienUneImage(NumImage, cb) {
        let query = connection.query('SELECT LienImage FROM image WHERE NumImage =  ?', NumImage, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'ajouter le lien d'une image dans la BDD
    static ajoutImage(LienImage, cb) {
        let query = connection.query('INSERT INTO image SET LienImage = ?', LienImage, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant de supprimer les images en paramètres
    static supprimerImages(images, cb) {
        if (images[0] == undefined) {
            cb("Done !")
        }
        else {
            for (let i = 0; i < images.length; i++) {
                let num = images[i].NumImage;
                // On supprime l'immage du cloud
                // Puis le lien de l'image avec l'article
                let query = connection.query('DELETE FROM image WHERE NumImage = ?', num, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            }
        }
    }

    // Fonction permettant de supprimer une image en paramètres
    static supprimerImage(num, cb) {
        // On supprime l'immage du cloud
        // Puis le lien de l'image avec l'article
        let query = connection.query('DELETE FROM image WHERE NumImage = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Image;