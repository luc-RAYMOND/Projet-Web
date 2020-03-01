var connection = require('../config/db');
var moment = require('moment');

class Devis {

    // Fonction permettant de créer un devis anonyme
    static créerDevisAnonyme(nomPrenom, cb) {
        var devis = { DateDevis: new Date(), LibelléStatutDevis: 'En attente de validation', NomPrénomProv: nomPrenom };
        var query = connection.query('INSERT INTO devis SET ?', devis, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant de créer un devis
    static créerDevis(cb) {
        var devis = { DateDevis: new Date(), LibelléStatutDevis: 'En attente de validation' };
        var query = connection.query('INSERT INTO devis SET ?', devis, (error, results) => {
            if (error) throw error;
            cb(results.insertId);
        });
    }

    // Fonction permettant de vérifier qu'un devis existe
    static vérifDevis(NumDevis, cb) {
        var query = connection.query('SELECT COUNT(*) as tot,LibelléStatutDevis,NomPrénomProv FROM devis WHERE NumDevis = ?', NumDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les devis en attente 
    static avoirDevisClientsAttente(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'En attente de validation'", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les devis en cours
    static avoirDevisClientsCours(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'En cours de traitement'", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les factures (devis terminés)
    static avoirFactureClients(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'Terminé'", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de supprimer un devis
    static supprimerDevis(numDevis, cb) {
        var query = connection.query("DELETE FROM devis WHERE NumDevis = ?", numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de mettre à jour le statut d'un devis
    static updateStatutDevis(libellé, numDevis, cb) {
        var query = connection.query("UPDATE devis SET LibelléStatutDevis = ? WHERE NumDevis = ?", [libellé, numDevis], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de mettre à jour le nom/prénom provisoire d'un devis
    static updateNomPrénomProv(numDevis, cb) {
        var query = connection.query("UPDATE devis SET NomPrénomProv = '-' WHERE NumDevis = ?", numDevis, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Devis;