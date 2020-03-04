var connection = require('../config/db');
var statistiques = require('../models/statistiques');
var affichage = require('../models/affichage');
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

    // Fonction permettant de vérifier qu'un devis existe
    static vérifAvoirDevis(NumDevis, NumUtilisateur, cb) {
        var query = connection.query('SELECT COUNT(*) as tot FROM avoirdevis WHERE NumDevis = ? AND NumUtilisateur = ?', [NumDevis, NumUtilisateur], (error, results) => {
            if (error) throw error;
            cb(results[0].tot);
        });
    }

    // Fonction permettant de récupérer les devis en attente 
    static avoirDevisClientsAttente(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'En attente de validation' ORDER BY DateDevis DESC", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les devis en cours
    static avoirDevisClientsCours(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'En cours de traitement' ORDER BY DateDevis DESC", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les factures (devis terminés)
    static avoirFactureClients(cb) {
        var query = connection.query("SELECT * FROM devis WHERE `LibelléStatutDevis` = 'Terminé' ORDER BY DateDevis DESC", (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les devis en attente d'un client 
    static avoirDevisClientAttente(numUtilisateur, cb) {
        var query = connection.query("SELECT * FROM devis,avoirdevis WHERE devis.NumDevis = avoirdevis.NumDevis AND `LibelléStatutDevis` = 'En attente de validation' AND NumUtilisateur = ? ORDER BY DateDevis DESC", numUtilisateur, (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les devis en cours d'un client
    static avoirDevisClientCours(numUtilisateur, cb) {
        var query = connection.query("SELECT * FROM devis,avoirDevis WHERE devis.NumDevis = avoirdevis.NumDevis AND `LibelléStatutDevis` = 'En cours de traitement' AND NumUtilisateur = ? ORDER BY DateDevis DESC", numUtilisateur, (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                results[i].DateDevis = moment(results[i].DateDevis).format("DD MMMM YYYY");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer les factures (devis terminés) d'un client
    static avoirFactureClient(numUtilisateur, cb) {
        var query = connection.query("SELECT * FROM devis,avoirDevis WHERE devis.NumDevis = avoirdevis.NumDevis AND `LibelléStatutDevis` = 'Terminé' AND NumUtilisateur = ? ORDER BY DateDevis DESC", numUtilisateur, (error, results) => {
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

    // Fonction permettant de mettre à jour la date d'une facture
    static dateFacture(numDevis, cb) {
        var query = connection.query("UPDATE devis SET DateDevis = ? WHERE NumDevis = ?", [new Date(), numDevis], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de mettre à jour le statut d'un devis
    static updateStatutDevis(libellé, numDevis, cb) {
        var query = connection.query("UPDATE devis SET LibelléStatutDevis = ? WHERE NumDevis = ?", [libellé, numDevis], (error, results) => {
            if (error) throw error;
            // Si on le passe en facture, alors on ajoute le montant au mois correspondant
            if (libellé == 'Terminé') {
                // On met la date de la facture à aujourd'hui
                this.dateFacture(numDevis, (ccb) => {
                    // On récupère le montant du devis
                    affichage.montantDevis([{ NumDevis: numDevis }], (montantDevis) => {
                        // Et on l'ajoute
                        statistiques.gagnerCA(montantDevis, (next) => {
                            cb(results);
                        });
                    });
                })
            }
            else {
                cb(results)
            }
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