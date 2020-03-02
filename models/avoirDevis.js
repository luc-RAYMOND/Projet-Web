var connection = require('../config/db');

class AvoirDevis {

    // Fonction permettant de créer un lien entre un devis et un utilisateur
    static créerLienDevis(numUtilisateur, numDevis, cb) {
        var avoirDevis = { numUtilisateur: numUtilisateur, numDevis: numDevis };
        var query = connection.query('INSERT INTO avoirDevis SET ?', avoirDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les infos d'un client à partir d'un devis
    static avoirUtilisateurDevis(numDevis, cb) {
        var query = connection.query('SELECT NomUtilisateur,PrénomUtilisateur, MailUtilisateur FROM utilisateur,avoirDevis WHERE avoirDevis.NumUtilisateur = utilisateur.NumUtilisateur AND NumDevis = ?', numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer le lien entre un devis et un utilisateur
    static supprimerLienDevisUtilisateur(numDevis, cb) {
        var query = connection.query('DELETE FROM avoirdevis WHERE NumDevis = ?', numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de mettre à jour le lien entre un devis et un utilisateur
    static updateLienDevis(numUtilisateur, numDevis, cb) {
        var query = connection.query('UPDATE avoirdevis SET NumUtilisateur = ? WHERE NumDevis = ?', [numUtilisateur, numDevis], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = AvoirDevis;