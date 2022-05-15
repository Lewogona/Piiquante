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

// Modify the sauce info
exports.modifySauce = (req, res, next) => {
    // Find if sauce exists with the sauce ID
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                return res.status(404).json({ error: "Sauce non trouvée !" })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: "Requête non autorisée !" })
            }
            
            // If the image is modified, delete previous image. If not, only update the new info
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

// Update sauce in database
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

// Delete sauce
exports.deleteSauce = (req, res, next) => {
    // Find if sauce exists with the sauce ID
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (!sauce) {
                return res.status(404).json({ error: "Sauce non trouvée !" })
            }
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: "Requête non autorisée !" })
            }
            
            // Delete the sauce and its image
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce supprimée !"}))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
};

// Like or dislike a sauce
exports.likeSauce = (req, res, next) => {
    // Find the sauce with sauce ID
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const isLiked = sauce.usersLiked.find((userLikedId) => {
                return userLikedId === req.body.userId;
            })

            const isDisliked = sauce.usersDisliked.find((userDislikedId) => {
                return userDislikedId === req.body.userId;
            })

            // if the user wants to like/dislike when already liked/disliked
            if (req.body.like === 0) {
                // they cancel their like
                if (isLiked) {
                    sauce.likes -= 1;
                    sauce.usersLiked = sauce.usersLiked.filter((userLikedId) => {
                        return userLikedId !== req.body.userId;
                    })
                }
                // they cancel their dislike
                if (isDisliked) {
                    sauce.dislikes -= 1;
                    sauce.usersDisliked = sauce.usersDisliked.filter((userDislikedId) => {
                        return userDislikedId !== req.body.userId;
                    })
                }
            } 
            // if the user wants to like
            else if (req.body.like === 1) { 
                // and they never liked before
                if (!isLiked) {
                    sauce.likes += 1;
                    sauce.usersLiked.push(req.body.userId);
                }
                // and they already disliked before
                if (isDisliked) {
                    sauce.dislikes -= 1;
                    sauce.usersDisliked = sauce.usersDisliked.filter((userDislikedId) => {
                        return userDislikedId !== req.body.userId;
                    })
                }
            } 
            // if the user wants to dislike
            else if (req.body.like === -1) {
                // and they already liked before
                if (isLiked) {
                    sauce.likes -= 1;
                    sauce.usersLiked = sauce.usersLiked.filter((userLikedId) => {
                        return userLikedId !== req.body.userId;
                    })
                }
                // and they never disliked before
                if (!isDisliked) {
                    sauce.dislikes += 1;
                    sauce.usersDisliked.push(req.body.userId);
                }
            }
            
            // Update new like, dislike or cancellation
            Sauce.updateOne({ _id: req.params.id }, {
                likes: sauce.likes, usersLiked: sauce.usersLiked,
                dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked
            })
            .then(() => res.status(200).json({ message: "Likes mis à jour !" }))
            .catch(error => res.status(400).json({ error }));
            
        })
        .catch(error => res.status(400).json({ error }));
};