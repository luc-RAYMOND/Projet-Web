var connection = require('../config/db');
var moment = require('moment');

class LO {

    // Permet de récupérer tout ce qui se trouve dans le livre d'or
    static avoirAvisLO(cb) {
        var query = connection.query('SELECT * FROM livreor ORDER BY DateLO DESC', (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateLO = moment(results[i].DateLO).format("dddd DD MMMM YYYY, HH:mm");
            }
            cb(results);
        });
    }

    // Permet de récupérer un avis selon le numéro de l'avis
    static avoirLO(numLO, cb) {
        var query = connection.query('SELECT * FROM livreor WHERE NumLO = ?', numLO, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de récupèrer l'utilisateur qui a créé le message
    static utilisateurAvis(numLO, cb) {
        var query = connection.query('SELECT NumUtilisateur FROM livreor WHERE NumLO = ?', numLO, (error, results) => {
            cb(results);
        });
    }

    // Permet d'insérer un avis dans le livre d'or
    static créationAvis(titre, avis, num, cb) {
        var LO = { TitreLo: titre, AvisLO: avis, DateLO: new Date(), NumUtilisateur: num };
        var query = connection.query('INSERT INTO livreor SET ?', LO, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de supprimer un avis dans le livre d'or
    static supprimerAvis(num, cb) {
        var query = connection.query('DELETE FROM livreor WHERE NumLO = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de mettre à jour un message du livre d'or
    static modifierAvis(titre, avis, num, cb) {
        var query = connection.query('UPDATE livreor SET TitreLO = ?, AvisLO = ? WHERE NumLO = ?', [titre, avis, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = LO;