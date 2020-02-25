var connection = require('../config/db');
var moment = require('moment');

class LO {

    static avoirAvisLO(cb) {
        var query = connection.query('SELECT * FROM livreor ORDER BY DateLO DESC', (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateLO = moment(results[i].DateLO).format("dddd DD MMMM YYYY, HH:mm");
            }
            cb(results);
        });
    }
    static créationAvis(titre, avis, num, cb) {
        var LO = { TitreLo: titre, AvisLO: avis, DateLO: new Date(), NumUtilisateur: num };
        var query = connection.query('INSERT INTO livreor SET ?', LO, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = LO;