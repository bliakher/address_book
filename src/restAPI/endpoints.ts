import { Request, Response } from 'express';
import { AuthenticationService } from '../authentication/AuthenticationService';
import { RequestWithToken, TokenManager } from '../authentication/TokenManager';
import { IContact } from '../contact_db/Contact';
import { ContactDatabase } from '../contact_db/ContactDatabase';
import { User } from '../user_db/User';
import { UserDatabase } from '../user_db/UserDatabase';
import { IContactRequest, IErrorResponse, ILoginRequest, IUserRequest } from './model';
import { validateContactRequest, validateUserRequest } from './validators';

/**
 * Handler for a request to create new contact for authenticated user
 * Gets user data from authentication token, checks that user exist.
 * Creates a new contact in the contact database.
 * @param req HTTP Request
 * @param res HTTP Response
 */
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
    const contactRequest: IContactRequest = req.body;
    if (!validateContactRequest(contactRequest)) {
        res.status(400);
        res.json(getErrorResponse("Contact data has incorrect format"));
        return;
    }
    const newContact : IContact = {
        familyName: contactRequest.familyName, 
        givenName: contactRequest.givenName, 
        phoneNumber: contactRequest.phoneNumber,
        address: contactRequest.address, 
        user: user.email};

    const db = ContactDatabase.getDatabase();
    const newId = await db.createContact(newContact);
    const success = newId !== undefined;

    if (success) {
        res.status(200);
        res.json({success: true, id: newId});
    } else {
        res.status(500);
        res.json(getErrorResponse("Contact couldn't be created - database error"));
    }

}
/**
 * Handler for a request to register new user.
 * Checks that user with that email doesn't exist already.
 * Creates new user in the user database.
 * Responds with an authentication token
 * @param req HTTP Request
 * @param res HTTP Response
 */
export const createUser = async (req: Request, res: Response) => {
    console.log("create user request");
    const userRequest: IUserRequest = req.body;
    if (!validateUserRequest(userRequest)) {
        res.status(400);
        res.json(getErrorResponse("User name or password have incorrect format"));
        return;
    }
    const db = UserDatabase.getDatabase();
    const hasUser = await db.hasUser(userRequest.email);
    if (hasUser) {
        res.status(409); // Conflict
        res.json(getErrorResponse("User with email " + userRequest.email + " already exists."));
        return;
    }
    const user = await db.createUser(userRequest.email, userRequest.password);
    const success = user.id !== undefined;

    if (success) {
        respondWithAuthToken(user, res);
    } else {
        res.status(500); // Internal Server Error
        res.json(getErrorResponse("User couldn't be registered."));
    }
}
/**
 * Handler for a request to login an existing user.
 * Checks that the user exists and that the password is correct.
 * Responds with an authentication token
 * @param req HTTP Request
 * @param res HTTP Response
 */
export const loginUser = async (req: Request, res: Response) => {
    console.log("login request");
    const loginRequest: ILoginRequest = req.body;
    if (!loginRequest.email || !loginRequest.password) {
        res.status(400);
        res.json(getErrorResponse("Email or password are missing from request."));
        return;
    }
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

/**
 * Function to generate an error response with error message
 * @param errorMsg Error message explaining the error
 * @returns Error response object
 */
const getErrorResponse: (errorMsg: string) => IErrorResponse = (errorMsg: string) => {
    return { success: false, error: errorMsg };
}

/**
 * Response after a correct authentication, contains a valid JWT token
 * @param user Authenticated user to create token for
 * @param res HTTP Response
 */
const respondWithAuthToken = (user: User, res: Response) => {
    const tokenManager = TokenManager.getManager();
    const token = tokenManager.createToken(user);
    res.status(200);
    res.json({success: true, token: token});
}

/**
 * Response after an incorrect authentication
 * @param res HTTP Response
 */
export const respondNotAuthenticated = (res: Response) => {
    res.status(401);
    res.json(getErrorResponse("Unathorized access"));
}
