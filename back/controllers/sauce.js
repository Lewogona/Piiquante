const Sauce = require("../models/Sauce");
const fs = require("fs");

// Create a new sauce
exports.createSauce = (req, res, next) => {
    // Retrieve data from the request
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    // Create a new instance of Sauce with new data and init likes/dislikes to 0
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    // Save the new sauce into database
    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
        .catch(error => res.status(400).json({ error }))
};

// Get all sauces in database
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

// Get one sauce in database with the sauce ID
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => req.status(404).json({ error }));
};

// Update the sauce info
exports.modifySauce = (req, res, next) => {
    // Find if sauce exist with the sauce ID
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                return res.status(404).json({ error: "Sauce non trouvée !" })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: "Requête non autorisée !" })
            }
            
            if(req.file) {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    updateSauce(req, res);
                })
            } else {
                updateSauce(req, res);
            }
        })
        .catch(error => res.status(500).json({ error }));   
}

function updateSauce(req, res) {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : { ...req.body };

    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
        .catch(error => res.status(403).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                return res.status(404).json({ error: "Sauce non trouvée !" })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: "Requête non autorisée !" })
            }
            
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée !"}))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const isLiked = sauce.usersLiked.find((userLikedId) => {
                return userLikedId === req.body.userId;
            })

            const isDisliked = sauce.usersDisliked.find((userDislikedId) => {
                return userDislikedId === req.body.userId;
            })

            if (req.body.like === 0) {
                if (isLiked) {
                    sauce.likes -= 1;
                    sauce.usersLiked = sauce.usersLiked.filter((userLikedId) => {
                        return userLikedId !== req.body.userId;
                    })
                }
                if (isDisliked) {
                    sauce.dislikes -= 1;
                    sauce.usersDisliked = sauce.usersDisliked.filter((userDislikedId) => {
                        return userDislikedId !== req.body.userId;
                    })
                }
            } else if (req.body.like === 1) {
                if (!isLiked) {
                    sauce.likes += 1;
                    sauce.usersLiked.push(req.body.userId);
                }
                if (isDisliked) {
                    sauce.dislikes -= 1;
                    sauce.usersDisliked = sauce.usersDisliked.filter((userDislikedId) => {
                        return userDislikedId !== req.body.userId;
                    })
                }
            } else if (req.body.like === -1) {
                if (isLiked) {
                    sauce.likes -= 1;
                    sauce.usersLiked = sauce.usersLiked.filter((userLikedId) => {
                        return userLikedId !== req.body.userId;
                    })
                }
                if (!isDisliked) {
                    sauce.dislikes += 1;
                    sauce.usersDisliked.push(req.body.userId);
                }
            }
                
            Sauce.updateOne({ _id: req.params.id }, {
                likes: sauce.likes, usersLiked: sauce.usersLiked,
                dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked
            })
            .then(() => res.status(200).json({ message: "Likes mis à jour !" }))
            .catch(error => res.status(400).json({ error }));
            
        })
        .catch(error => res.status(400).json({ error }));
};