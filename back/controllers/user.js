const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require("../models/User");

// Sign up a new user
exports.signup = (req, res, next) => {
    // Hash the password
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // Save new user in database
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

// Login
exports.login = (req, res, next) => {
    // Find if user exists
    User.findOne({ email: req.body.email })
        .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
    // Compare the password
    bcrypt.compare(req.body.password, user.password)
        .then(valid => {
        if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }
        res.status(200).json({
            userId: user._id,
            token: jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
            )
        });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};