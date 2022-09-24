import jwt from 'jsonwebtoken';
import { User } from '../user_db/User';
import { ITokenData } from './TokenData';
import { Request, Response, NextFunction } from 'express';
import { respond } from '../rest_api/responses';
import { UserDatabase } from '../user_db/UserDatabase';
import { ServiceContainer } from '../ServiceContainer';

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

    private readonly secret: string = process.env.TOKEN_SECRET;
    private readonly userDb: UserDatabase;

    constructor(container: ServiceContainer) {
        this.userDb = container.userDatabase;
    }

    /**
     * Authentication middleware for express
     * Parses auth. token from authorization header and includes it in the request
     * @param req HTTP Request
     * @param res HTTP Response
     * @param next next function
     */
    public async authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
        const token = TokenManager.parseToken(req);
        if (!token) {
            respond.notAuthenticated(res);
            return;
        }

        try {
            const decoded = await this.decodeVerify(token);
            (req as RequestWithToken).token = decoded;
        } catch (e) {
            respond.notAuthenticated(res);
            return;
        }

        next();
    }

    public decodeVerify(token: string): Promise<ITokenData> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.secret, (error, decoded) => {
                if (error) {
                    reject();
                    return;
                }
                const data = decoded as ITokenData;
                this.userDb.hasUser(data.user).then(has => {
                    if (has) {
                        resolve(data);
                    } else {
                        reject();
                    }
                });
            });
        });
    }

    private static parseToken(req: Request): string | undefined {
        const authorizaionHeader = req.headers['authorization'];
        if (!authorizaionHeader) return undefined;
        const splited = authorizaionHeader.split(' ');
        if (splited[0] != "Bearer" || splited.length < 2) return undefined;
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