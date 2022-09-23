import express from 'express';
import "reflect-metadata";
import { createContact, createUser, loginUser } from './restAPI/endpoints';
import dotenv from "dotenv";
import { UserDatabase } from './user_db/UserDatabase';
import { TokenManager } from './authentication/TokenManager';

const app = express();
dotenv.config();

// connect to the user database
UserDatabase.initialize();

app.use(express.json());

// create a new contact, only for authenticated users

app.post('/contacts', TokenManager.authenticationMiddleware, createContact);

// register a new user account
app.post('/register', createUser);

// login existing user
app.post('/login', loginUser);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});

