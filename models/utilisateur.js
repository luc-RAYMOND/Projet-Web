var connection = require('../config/db');

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

    // Fonction permettant de récupérer un pseudo en ayant le numéro Utilisateur
    static avoirPseudo(results, cb) {
        for (var i = 0; i < results.length; i++) {
            var query = connection.query('SELECT PseudoUtilisateur FROM utilisateur WHERE NumUtilisateur = ?', results[i].NumUtilisateur, (error, results) => {
                if (error) throw error;
                cb(results);
            });
        }
    }
    // Fonction permettant de créer un nouvel utilisateura
    static newUtilisateur(mail, nom, prenom, pseudo, mdp, tel, ville, rue, cp, pays, date, cb) {
        var user = { MailUtilisateur: mail, NomUtilisateur: nom, PrénomUtilisateur: prenom, PseudoUtilisateur: pseudo, MotDePasseUtilisateur: mdp, NumTéléphone: tel, VilleFacturationClient: ville, RueFacturationClient: rue, CodePostalFacturationClient: cp, PaysFacturationClient: pays, DateNaissanceUtilisateur: date, AdminUtilisateur: 0, EtatCompteUtilisateur: 0 };
        var query = connection.query('INSERT INTO utilisateur SET ?', user, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

}

module.exports = Utilisateur;