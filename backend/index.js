const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const missingDatabaseSettings = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter(
  (name) => !process.env[name]
);
if (missingDatabaseSettings.length > 0) {
  throw new Error(`Configuration base de données manquante: ${missingDatabaseSettings.join(', ')}`);
}

const app = express();
app.use(cors());
app.use(express.json());

// Configuration MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Récupération de tous les produits
app.get('/products', (req, res) => {
  db.query('SELECT p.id, p.nom, c.id AS categorieId, c.nom AS categorie, p.qteInit, p.seuil FROM products p JOIN categorie c ON p.categorie = c.id GROUP BY p.id', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Récupération d'un produit par ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
    db.query('SELECT p.id, p.nom, p.reference, c.id AS categorieId, c.nom AS categorie, p.qteInit, p.seuil FROM products p JOIN categorie c ON p.categorie = c.id WHERE p.id = ?', [id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Produit introuvable' });
      }
      res.json(results[0]);
    });
});

// Récupération liste des catégories
app.get('/categories', (req, res) => {
  db.query('SELECT id,nom FROM categorie', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Sauvegarder les modifications d'un produit
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { nom, reference, categorieId, qteInit, seuil } = req.body;

  if (!Number.isInteger(Number(categorieId)) || Number(categorieId) <= 0) {
    return res.status(400).json({ error: 'categorieId doit être un identifiant de catégorie valide' });
  }

  db.query('UPDATE products SET nom = ?, reference = ?, categorie = ?, qteInit = ?, seuil = ? WHERE id = ?', [nom, reference, Number(categorieId), qteInit, seuil, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Produit mis à jour' });
  });
});

// Ajouter un nouveau produit
app.post('/products', (req, res) => {
  const { nom, reference, categorieId, qteInit, seuil } = req.body;

  if (!Number.isInteger(Number(categorieId)) || Number(categorieId) <= 0) {
    return res.status(400).json({ error: 'categorieId doit être un identifiant de catégorie valide' });
  }

  db.query('INSERT INTO products (nom, reference, categorie, qteInit, seuil) VALUES (?, ?, ?, ?, ?)', [nom, reference, Number(categorieId), qteInit, seuil], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Produit ajouté', id: results.insertId });
  });
});

// Supprimer un produit
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Produit supprimé' });
  });
});

const PORT = 3000;
app.listen(PORT, 'localhost', () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});