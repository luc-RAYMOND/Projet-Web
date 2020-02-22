var Catégorie = require('../models/categorie');

// Permet de charger la page d'accueil
exports.accueil = (request,response) =>{
    // On utilise les fonctions faisant appel à la BDD pour afficher les catégories
    Catégorie.avoirNomCatégories((nom) =>{
        var compteur = 0;
        // Tableau contenant les couples nom / nombre d'articles par catégorie
        var contient = [];    
        Catégorie.avoirNombresCatégories(nom,(num) =>{
            contient[compteur] = {nom : nom[compteur].LibelléCatégorie, num : num[0].ite};
            compteur++;
            if (compteur == nom.length){
                // On fait un tri_bulle ici permettant d'avoir en premier les catégories avec le plus d'articles
                for(var k = contient.length - 1;k>0;k--){
                    for(var j = 0;j<k-1;j++){
                        if(contient[j+1].num>contient[j].num){
                            var intermediaire = contient[j];
                            contient[j] = contient[j+1];
                            contient[j+1] = intermediaire;
                        }
                    }
                }
                // On envoie sur la page le tableau avec ses informations
                response.render('pages/HC/accueilHC', {contient : contient});
            }
        });
    });
}