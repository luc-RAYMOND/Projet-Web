const connection = require('../config/db');

class avoirLC {

    // Fonction permettant de créer le lien entre une ligne de commande et un devis
    static créerLienLigneCommandeDevis(numDevis, numLC, cb) {
        let lien = { NumDevis: numDevis, NumLigneCommande: numLC };
        let query = connection.query('INSERT INTO avoirLC SET ?', lien, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant d'afficher les lignes de commandes d'un devis
    static avoirlignesCommandes(numDevis, cb) {
        let query = connection.query('SELECT lignecommande.NumLigneCommande,LibelléLigneCommande,PrixTarifUnitaire,Quantité FROM lignecommande,avoirlc WHERE lignecommande.NumLigneCommande = avoirlc.NumLigneCommande AND avoirlc.NumDevis = ?', numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'afficher les lignes de commandes d'un devis, en promesse pour faire tous les devis
    static avoirlignesCommandesDevis(NumDevis) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT lignecommande.NumLigneCommande,LibelléLigneCommande,PrixTarifUnitaire,Quantité FROM lignecommande,avoirlc WHERE lignecommande.NumLigneCommande = avoirlc.NumLigneCommande AND avoirlc.NumDevis = ?', NumDevis, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    // Fonction permettant de vérifier si un lien existe entre ce devis et cette ligne de commande
    static vérifDevisLigneCommande(NumDevis, NumLigneCommande, cb) {
        let query = connection.query('SELECT COUNT(*) as tot FROM avoirlc WHERE NumDevis = ? AND NumLigneCommande = ?', [NumDevis, NumLigneCommande], (error, results) => {
            if (error) throw error;
            cb(results[0].tot);
        });
    }

    // Fonction permettant de supprimer un lien entre un devis et une ligne de commande
    static supprimerLienDevisLC(NumDevis, NumLigneCommande, cb) {
        let query = connection.query('DELETE FROM avoirlc WHERE NumDevis = ? AND NumLigneCommande = ?', [NumDevis, NumLigneCommande], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer tous les liens entre un devis et ses lignes de commande
    static supprimerLiensDevisLC(NumDevis, cb) {
        let query = connection.query('DELETE FROM avoirlc WHERE NumDevis = ?', NumDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = avoirLC;