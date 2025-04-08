const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // ou ton port si différent

// Tâche 10 : Obtenir tous les livres
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("Tâche 10 - Liste de tous les livres :");
    console.log(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des livres :", error.message);
  }
};

// Task 11: Using Promises instead of async/await
const getBookByISBN = (isbn) => {
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`Livre avec ISBN ${isbn} :`);
      console.log(response.data);
    })
    .catch(error => {
      console.error("Erreur ISBN :", error.message);
    });
};



// Tâche 12 : Obtenir des livres par auteur
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    console.log(`Tâche 12 - Livres de l'auteur "${author}" :`);
    console.log(response.data);
  } catch (error) {
    console.error("Erreur Auteur :", error.message);
  }
};

// Tâche 13 : Obtenir des livres par titre
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    console.log(`Tâche 13 - Livres avec le titre "${title}" :`);
    console.log(response.data);
  } catch (error) {
    console.error("Erreur Titre :", error.message);
  }
};

// Appels de test :
getAllBooks();                 // Tâche 10
getBookByISBN("1");           // Tâche 11 - remplace "1" par un ISBN valide
getBooksByAuthor("Chinua Achebe"); // Tâche 12
getBooksByTitle("Things Fall Apart"); // Tâche 13



public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
  }

  // Utilisation de isValid()
  if (isValid(username)) {
    return res.status(400).json({ message: "Nom d'utilisateur déjà pris" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "Utilisateur enregistré avec succès" });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Livre non trouvé avec cet ISBN" });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const results = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const results = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour ce titre" });
  }
});



//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Livre non trouvé" });
  }
});


module.exports.general = public_users;
