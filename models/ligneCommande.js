var connection = require('../config/db');

class LigneCommande {

    // Fonction permettant de créer une ligne de commande
    static créerLigneCommande(libellé, quantité, prixU, cb) {
        var LC = { LibelléLigneCommande: libellé, Quantité: quantité, PrixTarifUnitaire: prixU };
        var query = connection.query('INSERT INTO lignecommande SET ?', LC, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant de supprimer une ligne de commande
    static supprimerLigneCommande(numLC, cb) {
        var query = connection.query('DELETE FROM lignecommande WHERE NumLigneCommande = ?', numLC, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = LigneCommande;