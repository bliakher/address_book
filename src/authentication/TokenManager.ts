import jwt from 'jsonwebtoken';
import { User } from '../user_db/User';
import { ITokenData } from './TokenData';
import { Request, Response, NextFunction } from 'express';
import { respondNotAuthenticated } from '../restAPI/endpoints';

const TOKEN_VALID_PERIOD = '15m';

export interface RequestWithToken extends Request {
    token: ITokenData;
}

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

    public static authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
        const token = TokenManager.parseToken(req);
        if (!token) {
            respondNotAuthenticated(res);
            return;
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
            console.log("decoding token - error: ", error, ", decoded: ", decoded);
            if (error) {
                respondNotAuthenticated(res);
                return;
            }
            const data = decoded as ITokenData;
            console.log("data: ", data);
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
    
    public createToken(user: User): string {
        const data = this.createTokenData(user);
        return jwt.sign(data, this.secret, { expiresIn: TOKEN_VALID_PERIOD });
    }

    public verifyToken(token: string) {
        return jwt.verify(token, this.secret);
    }

    public decodeData(token: string): void {
        jwt.verify(token, this.secret, (error, decoded) => {
            console.log("decoding token - error: ", error, ", decoded: ", decoded);
            if (error) return undefined;
            const data = decoded as ITokenData;
            console.log("data: ", data);
            if (data.user === undefined) return undefined;
            return data;
        });
    }

    private createTokenData(user: User): ITokenData {
        return {
            user: user.email
        };
    }
}