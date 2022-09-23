import express from 'express';
import { Request, Response, NextFunction } from 'express';
import "reflect-metadata";
import { createContact, createUser, loginUser } from './restAPI/endpoints';
import dotenv from "dotenv";
import { UserDatabase } from './user_db/UserDatabase';
import { TokenManager } from './authentication/TokenManager';

const app = express();
dotenv.config();

UserDatabase.initialize();

app.use(express.json());

app.get('', (req: Request, res: Response) => {
    res.status(200);
    res.json({running: true});
})

app.post('/contacts', TokenManager.authenticationMiddleware, createContact);

app.post('/register', createUser);

app.post('/login', loginUser);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});

