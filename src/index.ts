import express from 'express';
import "reflect-metadata";
import { createContact, createUser, loginUser } from './restAPI/endpoints';
import dotenv from "dotenv";
import { UserDatabase } from './user_db/UserDatabase';
import { TokenManager } from './authentication/TokenManager';

const app = express();
dotenv.config();

UserDatabase.initialize();

app.use(express.json());

app.post('/contacts', TokenManager.authenticationMiddleware, createContact);

app.post('/register', createUser);

app.post('/login', loginUser);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});



// const firebase_admin = require('firebase-admin');
// const service_account = require('./keys/serviceAdminKey.json');

// firebase_admin.initializeApp({
//     credential: firebase_admin.credential.cert(service_account)
// });

// const db = firebase_admin.firestore();