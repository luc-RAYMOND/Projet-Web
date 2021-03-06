const connection = require('../config/db');

class Utilisateur {

    // Fonction permettant de vérifier si le mail existe
    static mailExiste(mail, cb) {
        let query = connection.query('SELECT NumUtilisateur,AdminUtilisateur,MotDePasseUtilisateur,EtatCompteUtilisateur FROM utilisateur WHERE MailUtilisateur = ?', mail, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de vérifier si un pseudo existe
    static pseudoExiste(pseudo, cb) {
        let query = connection.query('SELECT PseudoUtilisateur FROM utilisateur WHERE PseudoUtilisateur = ?', pseudo, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer les informations d'un utilisateur
    static avoirUtilisateur(NumUtilisateur, cb) {
        let query = connection.query('SELECT * FROM utilisateur WHERE NumUtilisateur = ?', NumUtilisateur, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de récupérer un pseudo en ayant le numéro Utilisateur
    static avoirPseudo(NumUtilisateur) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT PseudoUtilisateur FROM utilisateur WHERE NumUtilisateur = ?', NumUtilisateur, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (result[0] != undefined) {
                        resolve(result[0].PseudoUtilisateur);
                    }
                    else {
                        resolve('Ancien Client');
                    }
                }
            });
        });
    }

    // Fonction permettant de créer un nouvel utilisateur
    static newUtilisateur(mail, nom, prenom, pseudo, mdp, tel, ville, rue, cp, pays, date, cb) {
        let user = { MailUtilisateur: mail, NomUtilisateur: nom, PrénomUtilisateur: prenom, PseudoUtilisateur: pseudo, MotDePasseUtilisateur: mdp, NumTéléphone: tel, VilleFacturationClient: ville, RueFacturationClient: rue, CodePostalFacturationClient: cp, PaysFacturationClient: pays, DateNaissanceUtilisateur: date, AdminUtilisateur: 0, EtatCompteUtilisateur: 0 };
        let query = connection.query('INSERT INTO utilisateur SET ?', user, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // On récupère tous les utilisateurs qui ont leur compte validé (à l'exception de l'admin)
    static avoirUtilisateurV(cb) {
        let query = connection.query('SELECT NumUtilisateur,NomUtilisateur,PrénomUtilisateur,PseudoUtilisateur,MailUtilisateur FROM utilisateur WHERE EtatCompteUtilisateur = 1 AND AdminUtilisateur = 0', (error, results) => {
            if (error) throw error;
            for (let i = 0; i < results.length; i++) {
                if (results[i].PseudoUtilisateur == '') {
                    results[i].PseudoUtilisateur = "Non défini";
                }
            }
            cb(results);
        });
    }

    // On récupère tous les utilisateurs qui n'ont pas leur compte validé
    static avoirUtilisateurNV(cb) {
        let query = connection.query('SELECT NumUtilisateur,NomUtilisateur,PrénomUtilisateur,PseudoUtilisateur,MailUtilisateur FROM utilisateur WHERE EtatCompteUtilisateur = 0', (error, results) => {
            if (error) throw error;
            for (let i = 0; i < results.length; i++) {
                if (results[i].PseudoUtilisateur == '') {
                    results[i].PseudoUtilisateur = "Non défini";
                }
            }
            cb(results);
        });
    }

    // Permet de supprimer un utilisateur
    static supprimerUtilisateur(num, cb) {
        let query = connection.query('DELETE FROM utilisateur WHERE NumUtilisateur = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de valider un utilisateur
    static validerUtilisateur(num, cb) {
        let query = connection.query('UPDATE utilisateur SET EtatCompteUtilisateur = 1 WHERE NumUtilisateur = ?', num, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de changer le mot de passe d'un utilisateur
    static modifMdp(mdp, num, cb) {
        let query = connection.query('UPDATE utilisateur SET MotDePasseUtilisateur = ? WHERE NumUtilisateur = ?', [mdp, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de mettre à jour le pseudo
    static modifPseudo(pseudo, num, cb) {
        let query = connection.query('UPDATE utilisateur SET PseudoUtilisateur = ? WHERE NumUtilisateur = ?', [pseudo, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Permet de mettre à jour le reste des infos
    static updateInfo(tel, ville, rue, cp, pays, date, num, cb) {
        let user = { NumTéléphone: tel, VilleFacturationClient: ville, RueFacturationClient: rue, CodePostalFacturationClient: cp, PaysFacturationClient: pays, DateNaissanceUtilisateur: date };
        let query = connection.query('UPDATE utilisateur SET ? WHERE NumUtilisateur = ?', [user, num], (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Utilisateur;