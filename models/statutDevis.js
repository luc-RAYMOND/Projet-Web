const connection = require('../config/db');

class StatutDevis {

    // Fonction permettant de récupérer les différents status de devis
    static avoirStatutsDevis(cb) {
        let query = connection.query('SELECT * FROM statutdevis', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = StatutDevis;