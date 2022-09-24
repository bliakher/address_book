import { Request, Response } from 'express';
import { AuthenticationService } from '../authentication/AuthenticationService';
import { RequestWithToken, TokenManager } from '../authentication/TokenManager';
import { IContact } from '../contact_db/Contact';
import { ContactDatabase } from '../contact_db/ContactDatabase';
import { UserDatabase } from '../user_db/UserDatabase';
import { IContactRequest, ILoginRequest, IUserRequest } from './model';
import { respond } from './responses';
import { validateContactRequest, validateUserRequest } from './validators';
import { ServiceContainer } from '../ServiceContainer'


export class Controller {

    private readonly userDatabase: UserDatabase;
    private readonly contactDatabase: ContactDatabase;
    private readonly tokenManager: TokenManager;
    
    constructor(container: ServiceContainer) {
        this.userDatabase = container.userDatabase;
        this.contactDatabase = container.contactDatabase;
        this.tokenManager = container.tokenManager;
    }

    /**
     * Handler for a request to create new contact for authenticated user
     * Gets user data from authentication token, checks that user exist.
     * Creates a new contact in the contact database.
     * @param req HTTP Request
     * @param res HTTP Response
     */
    public async createContact(req: Request, res: Response) {
        console.log('create contact request');
        const token = (req as RequestWithToken).token;
        if (!token) {
            respond.notAuthenticated(res);
            return;
        }
        const contactRequest: IContactRequest = req.body;
        if (!validateContactRequest(contactRequest)) {
            respond.badRequest(res, 'Contact data has incorrect format');
            return;
        }
        const newContact: IContact = {
            familyName: contactRequest.familyName,
            givenName: contactRequest.givenName,
            phoneNumber: contactRequest.phoneNumber,
            address: contactRequest.address,
            user: token.user
        };

        const newId = await this.contactDatabase.createContact(newContact);
        const success = newId !== undefined;

        if (success) {
            respond.withId(res, newId);
        } else {
            respond.serverError(res, 'Contact couldn\'t be created - database error');
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
    public async createUser(req: Request, res: Response) {
        console.log('create user request');
        const userRequest: IUserRequest = req.body;
        if (!validateUserRequest(userRequest)) {
            respond.badRequest(res, 'User name or password have incorrect format');
            return;
        }
        const hasUser = await this.userDatabase.hasUser(userRequest.email);
        if (hasUser) {
            respond.badRequest(res, 'User with email ' + userRequest.email + ' already exists.')
            return;
        }
        const user = await this.userDatabase.createUser(userRequest.email, userRequest.password);
        const success = user.id !== undefined;

        if (success) {
            const token = this.tokenManager.createToken(user);
            respond.withAuthToken(res, token);
        } else {
            respond.serverError(res, 'User couldn\'t be registered.');
        }
    }

    /**
     * Handler for a request to login an existing user.
     * Checks that the user exists and that the password is correct.
     * Responds with an authentication token
     * @param req HTTP Request
     * @param res HTTP Response
     */
    public async loginUser(req: Request, res: Response) {
        console.log('login request');
        const loginRequest: ILoginRequest = req.body;
        if (!loginRequest.email || !loginRequest.password) {
            respond.badRequest(res, 'Email or password are missing from request.');
            return;
        }
        const user = await this.userDatabase.getUser(loginRequest.email);

        if (!user) {
            respond.notAuthenticated(res, 'Invalid email or password');
            return;
        }
        const correctPswd = AuthenticationService.isCorrectPassword(user, loginRequest.password, process.env.PEPPER);
        if (correctPswd) {
            respond.withAuthToken(res, this.tokenManager.createToken(user));
        } else {
            respond.notAuthenticated(res, 'Invalid email or password');
        }
    }
}

