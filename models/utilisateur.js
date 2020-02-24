var connection = require('../config/db');

class Utilisateur {

    // Fonction permettant de vérifier si le mail existe
    static mailExiste(mail, cb) {
        var query = connection.query('SELECT NumUtilisateur,AdminUtilisateur,MotDePasseUtilisateur FROM utilisateur WHERE MailUtilisateur = ?', mail, (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = Utilisateur;