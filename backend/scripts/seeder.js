const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: './.env' });

// Charger les modèles
const Utilisateur = require('../src/models/Utilisateur');
const Categorie = require('../src/models/Categorie');
const Service = require('../src/models/Service');
const Signalement = require('../src/models/Signalement');

// Connecter à la base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SFE_Platforme')
.then(() => {
  console.log(`MongoDB connecté à ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`.cyan.underline);
})
.catch(err => {
  console.error('Erreur de connexion MongoDB:', err);
  process.exit(1);
});

// Lire les fichiers JSON
console.log('Lecture des fichiers JSON...');

let utilisateurs, categories, services, signalements;

try {
  utilisateurs = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/utilisateurs.json`, 'utf-8')
  );
  console.log(`${utilisateurs.length} utilisateurs chargés`.green);
} catch (err) {
  console.error(`Erreur lors de la lecture des utilisateurs: ${err.message}`.red);
  process.exit(1);
}

try {
  categories = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/categories.json`, 'utf-8')
  );
  console.log(`${categories.length} catégories chargées`.green);
} catch (err) {
  console.error(`Erreur lors de la lecture des catégories: ${err.message}`.red);
  process.exit(1);
}

try {
  services = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/services.json`, 'utf-8')
  );
  console.log(`${services.length} services chargés`.green);
} catch (err) {
  console.error(`Erreur lors de la lecture des services: ${err.message}`.red);
  process.exit(1);
}

try {
  signalements = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/signalements.json`, 'utf-8')
  );
  console.log(`${signalements.length} signalements chargés`.green);
} catch (err) {
  console.error(`Erreur lors de la lecture des signalements: ${err.message}`.red);
  process.exit(1);
}

// Importer les données dans la base de données
const importData = async () => {
  try {
    // Supprimer les données existantes
    console.log('Suppression des données existantes...');
    
    try {
      await Signalement.deleteMany();
      console.log('Signalements existants supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des signalements, on continue...'.yellow);
    }
    
    try {
      await Categorie.deleteMany();
      console.log('Catégories existantes supprimées'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des catégories, on continue...'.yellow);
    }
    
    try {
      await Service.deleteMany();
      console.log('Services existants supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des services, on continue...'.yellow);
    }
    
    try {
      await Utilisateur.deleteMany();
      console.log('Utilisateurs existants supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des utilisateurs, on continue...'.yellow);
    }

    // Importer les utilisateurs
    console.log('Importation des utilisateurs...');
    const createdUsers = await Utilisateur.create(utilisateurs);
    console.log('Utilisateurs importés'.green);

    // Importer les catégories
    console.log('Importation des catégories...');
    const createdCategories = await Categorie.create(categories);
    console.log('Catégories importées'.green);

    // Importer les services
    console.log('Importation des services...');
    const createdServices = await Service.create(services);
    console.log('Services importés'.green);

    // Importer les signalements avec les références correctes
    console.log('Importation des signalements...');
    
    // Ajouter des références aux signalements
    const signalementData = signalements.map(signalement => {
      return {
        ...signalement,
        catégorie: createdCategories[Math.floor(Math.random() * createdCategories.length)]._id,
        utilisateur: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
        service: createdServices[Math.floor(Math.random() * createdServices.length)]._id
      };
    });

    await Signalement.create(signalementData);
    console.log('Signalements importés'.green);

    console.log('Toutes les données importées avec succès'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`Erreur: ${err.message}`.red);
    console.error(err);
    process.exit(1);
  }
};

// Supprimer les données
const deleteData = async () => {
  try {
    console.log('Suppression des données...');
    
    try {
      await Signalement.deleteMany();
      console.log('Signalements supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des signalements, on continue...'.yellow);
    }
    
    try {
      await Categorie.deleteMany();
      console.log('Catégories supprimées'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des catégories, on continue...'.yellow);
    }
    
    try {
      await Service.deleteMany();
      console.log('Services supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des services, on continue...'.yellow);
    }
    
    try {
      await Utilisateur.deleteMany();
      console.log('Utilisateurs supprimés'.yellow);
    } catch (err) {
      console.log('Erreur lors de la suppression des utilisateurs, on continue...'.yellow);
    }

    console.log('Toutes les données supprimées...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`Erreur: ${err.message}`.red);
    process.exit(1);
  }
};

// Exécuter la commande en fonction de l'argument
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Utilisation: node seeder.js -i (import) ou -d (delete)'.cyan);
  process.exit();
}