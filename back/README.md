# Piiquante API

This project was created with :
- [NodeJS](https://nodejs.org/en/)
- [Express](https://github.com/expressjs/express)
- [Mongoose](https://github.com/Automattic/mongoose)
- [Mongoose Unique Validator](https://github.com/blakehaswell/mongoose-unique-validator)
- [Multer](https://github.com/expressjs/multer)
- [JSON Web Token](https://github.com/joaquimserafim/json-web-token)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)

## Install

Run `npm i` to install the dependencies. 

## Run the app

Run `npm start` to launch the API.

# REST API

You can see below all the available API routes

## User

- POST `/api/auth/signup` to signup
- POST `/api/auth/login` to login

## Sauce

- GET `/api/sauces/` to get all the sauces
- POST `/api/sauces/` to create a new sauce
- GET `/api/sauces/:id` to get one sauce
- PUT `/api/sauces/:id` to modify a sauce
- DELETE `/api/sauces/:id` to delete a sauce
- POST `/api/sauces/:id/like` to like or dislike a sauce

