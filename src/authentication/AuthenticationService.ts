import { User } from "../user_db/User";
import { PasswordUtils } from "../utils/PasswordUtils";

export class AuthenticationService {

    public static isCorrectPassword(user: User, password: string, pepper: string): boolean {
        const hash = PasswordUtils.getPasswordHash(password, user.salt, pepper);
        return user.passwordHash === hash;
    }
}