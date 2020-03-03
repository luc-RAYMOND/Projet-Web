var connection = require('../config/db');
var moment = require('moment');

class Utilisateur {

    // Fonction permettant de vérifier si le mail existe
    static mailExiste(mail, cb) {
        var query = connection.query('SELECT NumUtilisateur,AdminUtilisateur,MotDePasseUtilisateur,EtatCompteUtilisateur FROM utilisateur WHERE MailUtilisateur = ?', mail, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de vérifier si un pseudo existe
    static pseudoExiste(pseudo, cb) {
        var query = connection.query('SELECT PseudoUtilisateur FROM utilisateur WHERE PseudoUtilisateur = ?', pseudo, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les informations d'un utilisateur
    static avoirUtilisateur(NumUtilisateur, cb) {
        var query = connection.query('SELECT * FROM utilisateur WHERE NumUtilisateur = ?', NumUtilisateur, (error, results) => {
            if (error) throw error;
            if (results[0] != undefined) {
                results[0].DateNaissanceUtilisateur = moment(results[0].DateNaissanceUtilisateur).format("YYYY-MM-DD");
            }
            cb(results);
        });
    }

    // Fonction permettant de récupérer un pseudo en ayant le numéro Utilisateur
    static avoirPseudo(results, cb) {
        for (var i = 0; i < results.length; i++) {
            var query = connection.query('SELECT PseudoUtilisateur FROM utilisateur WHERE NumUtilisateur = ?', results[i].NumUtilisateur, (error, results) => {
                if (error) throw error;
                cb(results);
            });
        }
    }

    // Fonction permettant de créer un nouvel utilisateur
    static newUtilisateur(mail, nom, prenom, pseudo, mdp, tel, ville, rue, cp, pays, date, cb) {
        var user = { MailUtilisateur: mail, NomUtilisateur: nom, PrénomUtilisateur: prenom, PseudoUtilisateur: pseudo, MotDePasseUtilisateur: mdp, NumTéléphone: tel, VilleFacturationClient: ville, RueFacturationClient: rue, CodePostalFacturationClient: cp, PaysFacturationClient: pays, DateNaissanceUtilisateur: date, AdminUtilisateur: 0, EtatCompteUtilisateur: 0 };
        var query = connection.query('INSERT INTO utilisateur SET ?', user, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // On récupère tous les utilisateurs qui ont leur compte validé (à l'exception de l'admin)
    static avoirUtilisateurV(cb) {
        var query = connection.query('SELECT NumUtilisateur,NomUtilisateur,PrénomUtilisateur,PseudoUtilisateur,MailUtilisateur FROM utilisateur WHERE EtatCompteUtilisateur = 1 AND AdminUtilisateur = 0', (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                if (results[i].PseudoUtilisateur == '') {
                    results[i].PseudoUtilisateur = "Non défini";
                }
            }
            cb(results);
        });
    }

    // On récupère tous les utilisateurs qui n'ont pas leur compte validé
    static avoirUtilisateurNV(cb) {
        var query = connection.query('SELECT NumUtilisateur,NomUtilisateur,PrénomUtilisateur,PseudoUtilisateur,MailUtilisateur FROM utilisateur WHERE EtatCompteUtilisateur = 0', (error, results) => {
            if (error) throw error;
            for (var i = 0; i < results.length; i++) {
                if (results[i].PseudoUtilisateur == '') {
                    results[i].PseudoUtilisateur = "Non défini";
                }
            }
            cb(results);
        });
    }

    // Permet de supprimer un utilisateur
    static supprimerUtilisateur(num, cb) {
        var query = connection.query('DELETE FROM utilisateur WHERE NumUtilisateur = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de valider un utilisateur
    static validerUtilisateur(num, cb) {
        var query = connection.query('UPDATE utilisateur SET EtatCompteUtilisateur = 1 WHERE NumUtilisateur = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de changer le mot de passe d'un utilisateur
    static modifMdp(mdp, num, cb) {
        var query = connection.query('UPDATE utilisateur SET MotDePasseUtilisateur = ? WHERE NumUtilisateur = ?', [mdp, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de mettre à jour le pseudo
    static modifPseudo(pseudo, num, cb) {
        var query = connection.query('UPDATE utilisateur SET PseudoUtilisateur = ? WHERE NumUtilisateur = ?', [pseudo, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de mettre à jour le reste des infos
    static updateInfo(tel, ville, rue, cp, pays, date, num, cb) {
        var user = { NumTéléphone: tel, VilleFacturationClient: ville, RueFacturationClient: rue, CodePostalFacturationClient: cp, PaysFacturationClient: pays, DateNaissanceUtilisateur: date };
        var query = connection.query('UPDATE utilisateur SET ? WHERE NumUtilisateur = ?', [user, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Utilisateur;