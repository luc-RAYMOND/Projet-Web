var connection = require('../config/db');

class Stats {

    // Fonction permettant de récupérer les stats pour les jours
    static avoirStats(cb) {
        // On reset si on change de jour
        this.resetDay((next) => {
            var query = connection.query('SELECT * FROM statistiquesjour ORDER BY DateStats', (error, results) => {
                if (error) throw error;
                cb(results);
            });
        });
    }

    // Fonction permettant de récupérer les stats pour les mois
    static avoirStatsDesMois(cb) {
        // On reset si on change de mois
        this.resetMonth((next) => {
            var query = connection.query('SELECT * FROM statistiquesmois ORDER BY DateStats DESC', (error, results) => {
                if (error) throw error;
                cb(results);
            });
        });
    }

    // Fonction permettant de récupérer les stats du jour actuel
    static avoirStatsToday(cb) {
        this.resetDay((next) => {
            var query = connection.query('SELECT * FROM statistiquesjour WHERE DateStats = CURDATE()', (error, results) => {
                if (error) throw error;
                cb(results);
            });
        });
    }

    // Fonction permettant de récupérer les stats du mois actuel
    static avoirStatsMois(cb) {
        this.resetMonth((next) => {
            var query = connection.query('SELECT * FROM statistiquesmois WHERE MONTH(DateStats) = MONTH(CURDATE())', (error, results) => {
                if (error) throw error;
                cb(results);
            });
        });
    }

    // Fonction permettant d'incrémenter de un le nombre de visite dans les jours et dans les mois
    static gagnerUneVue(cb) {
        // On reset s'il faut reset le jour
        this.resetDay((nex) => {
            // Le mois s'il faut aussi
            this.resetMonth((ne) => {
                this.avoirStatsToday((statToday) => {
                    var nbVisites = statToday[0].NombreVisitesStats + 1;
                    // On rajoute pour le jour
                    var query = connection.query('UPDATE statistiquesjour SET NombreVisitesStats = ? WHERE DateStats = CURDATE()', nbVisites, (error, results) => {
                        if (error) throw error;
                        this.avoirStatsMois((statsMonth) => {
                            var nbVisites2 = statsMonth[0].NombreVisitesStats + 1;
                            var query2 = connection.query('UPDATE statistiquesmois SET NombreVisitesStats = ? WHERE MONTH(DateStats) = MONTH(CURDATE())', [nbVisites2, statsMonth[0].DateStats], (error, results2) => {
                                if (error) throw error;
                                cb(results2);
                            });
                        })
                    });
                });
            });
        });
    }

    // Fonction permettant de remettre à 0 lorqu'on change de jour
    static resetDay(cb) {
        var query = connection.query('UPDATE statistiquesjour SET NombreVisitesStats = 0, DateStats = CURDATE() WHERE (DATEDIFF(CURDATE(),DateStats) % 7) = 0 AND DATEDIFF(CURDATE(),DateStats) != 0', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant de reset à 0 lorsqu'on change de mois
    static resetMonth(cb) {
        var query = connection.query('UPDATE statistiquesmois SET NombreVisitesStats = 0, CAMois = 0, DateStats = CURDATE() WHERE MONTH(CURDATE()) = MONTH(DateStats) AND YEAR(CURDATE()) != YEAR(DateStats)', (error, results) => {
            if (error) throw error;
            cb(results);
        });
    }

    // Fonction permettant d'ajouter le CA d'une facture terminée dans le mois correspondant
    static gagnerCA(CA, cb) {
        // On remet le mois à 0 si besoin
        this.resetMonth((next) => {
            this.avoirStatsMois((statsMonth) => {
                var CATotal = Number(statsMonth[0].CAMois) + Number(CA[0]);
                var query2 = connection.query('UPDATE statistiquesmois SET CAMois = ? WHERE MONTH(DateStats) = MONTH(CURDATE())', [CATotal, statsMonth[0].DateStats], (error, results) => {
                    if (error) throw error;
                    cb(results);
                });
            });
        });
    }
}

module.exports = Stats;