const connection = require('../config/db');

class AvoirDevis {

    // Fonction permettant de créer un lien entre un devis et un utilisateur
    static créerLienDevis(numUtilisateur, numDevis, cb) {
        let avoirDevis = { numUtilisateur: numUtilisateur, numDevis: numDevis };
        let query = connection.query('INSERT INTO avoirDevis SET ?', avoirDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les infos d'un client à partir d'un devis
    static avoirUtilisateurDevis(NumDevis) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT NomUtilisateur,PrénomUtilisateur, MailUtilisateur FROM utilisateur,avoirDevis WHERE avoirDevis.NumUtilisateur = utilisateur.NumUtilisateur AND NumDevis = ?', NumDevis, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    // Fonction permettant de supprimer le lien entre un devis et un utilisateur
    static supprimerLienDevisUtilisateur(numDevis, cb) {
        let query = connection.query('DELETE FROM avoirdevis WHERE NumDevis = ?', numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de supprimer le lien entre les devis et son utilisateur
    static supprimerLiensDevisUtilisateur(numUtilisateur, cb) {
        let query = connection.query('DELETE FROM avoirdevis WHERE NumUtilisateur = ?', numUtilisateur, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de mettre à jour le lien entre un devis et un utilisateur
    static updateLienDevis(numUtilisateur, numDevis, cb) {
        let query = connection.query('UPDATE avoirdevis SET NumUtilisateur = ? WHERE NumDevis = ?', [numUtilisateur, numDevis], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = AvoirDevis;