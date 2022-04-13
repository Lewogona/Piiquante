const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect('mongodb+srv://Lewogona:gaxUK2VQF9w81Eb6@cluster0.pi6d3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!')
})

module.exports = app;