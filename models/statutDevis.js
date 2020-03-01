var connection = require('../config/db');
var moment = require('moment');

class StatutDevis {

    // Fonction permettant de récupérer les différents status de devis
    static avoirStatutsDevis(cb) {
        var query = connection.query('SELECT * FROM statutdevis', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = StatutDevis;