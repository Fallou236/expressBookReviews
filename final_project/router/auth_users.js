const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Nom d'utilisateur et mot de passe requis."});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: username },
      'secret_key', // remplace par une vraie clé secrète
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({message: "Connexion réussie."});
  } else {
    return res.status(401).json({message: "Nom d'utilisateur ou mot de passe incorrect."});
  }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  if (!review) {
    return res.status(400).json({ message: "Aucune critique fournie." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé." });
  }

  // Ajouter ou mettre à jour la critique
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Critique ajoutée/modifiée avec succès.",
    reviews: books[isbn].reviews
  });
});

// Supprimer une critique pour un livre donné par l'utilisateur connecté
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
      return res.status(401).json({ message: "Utilisateur non connecté." });
  }

  if (!books[isbn]) {
      return res.status(404).json({ message: "Livre introuvable." });
  }

  if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Critique supprimée avec succès." });
  } else {
      return res.status(404).json({ message: "Aucune critique trouvée pour cet utilisateur." });
  }
});

// Supprimer un livre
regd_users.delete("/auth/book/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    delete books[isbn];
    return res.status(200).json({ message: `Le livre avec ISBN ${isbn} a été supprimé avec succès.` });
  } else {
    return res.status(404).json({ message: `Aucun livre trouvé avec l'ISBN ${isbn}.` });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
