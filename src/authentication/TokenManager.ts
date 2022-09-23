import jwt from 'jsonwebtoken';
import { User } from '../user_db/User';
import { ITokenData } from './TokenData';
import { Request, Response, NextFunction } from 'express';
import { respondNotAuthenticated } from '../restAPI/endpoints';

/** Time after which a token expires */
const TOKEN_VALID_PERIOD = '15m';

/**
 * HTTP request with authentication token
 */
export interface RequestWithToken extends Request {
    token: ITokenData;
}

/**
 * Athentication tokens manager
 * Creates, verifies and decodes JWT tokens
 * Implemented as a singleton
 */
export class TokenManager {

    private static instance: TokenManager;
    private secret: string = process.env.TOKEN_SECRET;
    private constructor() {
    }
    public static getManager() {
        if (!this.instance) {
            this.instance = new TokenManager();
        }
        return this.instance;
    }

    /**
     * Authentication middleware for express
     * Parses auth. token from authorization header and includes it in the request
     * @param req HTTP Request
     * @param res HTTP Response
     * @param next next function
     */
    public static authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
        const token = TokenManager.parseToken(req);
        if (!token) {
            respondNotAuthenticated(res);
            return;
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
            if (error) {
                respondNotAuthenticated(res);
                return;
            }
            const data = decoded as ITokenData;
            if (data.user === undefined) {
                respondNotAuthenticated(res);
                return;
            }
            (req as RequestWithToken).token = data;
            next();
        });
    }

    private static parseToken(req: Request): string | undefined {
        const authorizaionHeader = req.headers['authorization'];
        if (!authorizaionHeader) return undefined;
        const splited = authorizaionHeader.split(' ');
        if(splited[0] != "Bearer" || splited.length < 2) return undefined;
        return splited[1];
    }
    
    /**
     * Creates a new JWT token from user data
     * @param user User to authenticate
     * @returns encoded token
     */
    public createToken(user: User): string {
        const data = this.createTokenData(user);
        return jwt.sign(data, this.secret, { expiresIn: TOKEN_VALID_PERIOD });
    }

    private createTokenData(user: User): ITokenData {
        return {
            user: user.email
        };
    }
}