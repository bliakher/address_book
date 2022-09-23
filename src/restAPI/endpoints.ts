import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../authentication/AuthenticationService';
import { RequestWithToken, TokenManager } from '../authentication/TokenManager';
import { IContact } from '../contact_db/Contact';
import { ContactDatabase } from '../contact_db/ContactDatabase';
import { User } from '../user_db/User';
import { UserDatabase } from '../user_db/UserDatabase';
import { IContactRequest, ICreateResponse, IErrorResponse, ILoginRequest, IUserRequest } from './model';


export const authenticateAndDecodeUser = (req: Request, res: Response, next: NextFunction) => {
    const token = parseToken(req);
    const tokenManager = TokenManager.getManager();
    const data = tokenManager.decodeData(token);
    
}

// Authorization: Bearer <token>
const parseToken: (req: Request) => string | undefined = (req: Request) => {
    const authorizaionHeader = req.headers['authorization'];
    if (!authorizaionHeader) return undefined;
    const splited = authorizaionHeader.split(' ');
    if(splited[0] != "Bearer" || splited.length < 2) return undefined;
    return splited[1];
}

export const createContact = async (req: Request, res: Response) => {
    console.log("create contact request");
    const token = (req as RequestWithToken).token;
    if (!token) {
        respondNotAuthenticated(res);
        return;
    }
    const user = await UserDatabase.getDatabase().getUser(token.user);
    if (!user) {
        res.status(400); // Bad Request
        res.json(getErrorResponse("Unknown user: " + token.user));
        return;
    }

    const contactRequest: IContactRequest = req.body; // ToDo: validate data
    const familyName = contactRequest.familyName ?? "";
    const givenName = contactRequest.givenName ?? "";
    const phoneNumber = contactRequest.phoneNumber ?? "";
    const address = contactRequest.address ?? "";
    const email = user.email;
    const newContact : IContact = {familyName, givenName, phoneNumber, address, user: email};

    const db = ContactDatabase.getDatabase();
    const newId = await db.createContact(newContact);

    const response: ICreateResponse = {success: newId !== undefined, id: newId};

    res.json(response);
    res.status(200); // ToDo: handle error situations
}

export const createUser = async (req: Request, res: Response) => {
    console.log("create user request");
    const userRequest: IUserRequest = req.body;
    // ToDo: validate email and password
    const email = userRequest.email ?? "";
    const password = userRequest.password ?? "";

    const db = UserDatabase.getDatabase();
    const hasUser = await db.hasUser(email);
    console.log("has user " + email + ": ", hasUser);
    if (hasUser) {
        res.status(409); // Conflict
        res.json(getErrorResponse("User with email " + email + " already exists."));
        return;
    }
    const user = await db.createUser(email, password);
    const success = user.id !== undefined;

    if (success) {
        respondWithAuthToken(user, res);
    } else {
        res.status(500); // Internal Server Error
        res.json(getErrorResponse("User couldn't be registered."));
    }
}

export const loginUser = async (req: Request, res: Response) => {
    console.log("login request");
    const loginRequest: ILoginRequest = req.body;
    // ToDo: validate email and password
    const db = UserDatabase.getDatabase();
    const user = await db.getUser(loginRequest.email);

    if (!user) {
        res.status(404); // Not Found
        res.json(getErrorResponse("Invalid email " + loginRequest.email));
        return;
    }
    const correctPswd = AuthenticationService.isCorrectPassword(user, loginRequest.password, process.env.PEPPER);
    if (correctPswd) {
        respondWithAuthToken(user, res);
    } else {
        res.status(401); // Unauthorized
        res.json(getErrorResponse("Incorrect password"));
    }
}

const getErrorResponse: (errorMsg: string) => IErrorResponse = (errorMsg: string) => {
    return { success: false, error: errorMsg };
}

const respondWithAuthToken = (user: User, res: Response) => {
    const tokenManager = TokenManager.getManager();
    const token = tokenManager.createToken(user);
    res.status(200);
    res.json({success: true, token: token});
}

export const respondNotAuthenticated = (res: Response) => {
    res.status(401);
    res.json(getErrorResponse("Unathorized access"));
}
