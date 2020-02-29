var connection = require('../config/db');
var fs = require('fs');

class Image {

    // Fonction permettant de récupérer les noms des images
    static liensImage(cb) {
        var query = connection.query('SELECT LienImage FROM image', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer le nom d'une image
    static lienUneImage(NumImage, cb) {
        var query = connection.query('SELECT LienImage FROM image WHERE NumImage =  ?', NumImage, (error, results) => {
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

    // Fonction permettant de supprimer les images en paramètres
    static supprimerImages(images, cb) {
        if (images[0] == undefined) {
            cb("Done !")
        }
        else {
            for (var i = 0; i < images.length; i++) {
                var num = images[i].NumImage;
                this.lienUneImage(num, (lien) => {
                    var link = 'public/images/articles/' + lien[0].LienImage;
                    // On supprime l'immage du serveur
                    fs.unlink(link, (err) => {
                        if (err) throw err;
                        // Puis le lien de l'image avec l'article
                        var query = connection.query('DELETE FROM image WHERE NumImage = ?', num, (error, results) => {
                            if (error) throw error;
                            cb(results);
                        });
                    });
                })
            }
        }
    }

    // Fonction permettant de supprimer une image en paramètres
    static supprimerImage(num, cb) {
        this.lienUneImage(num, (lien) => {
            var link = 'public/images/articles/' + lien[0].LienImage;
            // On supprime l'immage du serveur
            fs.unlink(link, (err) => {
                if (err) throw err;
                // Puis le lien de l'image avec l'article
                var query = connection.query('DELETE FROM image WHERE NumImage = ?', num, (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            });
        })
    }
}

module.exports = Image;