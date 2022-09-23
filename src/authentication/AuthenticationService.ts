import { User } from "../user_db/User";
import { PasswordUtils } from "../utils/PasswordUtils";

/**
 * Class with services for authentication
 */
export class AuthenticationService {

    /**
     * Compares given password to astored password hash
     * @param user User to authenticate
     * @param password Entered password
     * @param pepper pepper used in hash creation
     * @returns if it is the correct password for the user
     */
    public static isCorrectPassword(user: User, password: string, pepper: string): boolean {
        const hash = PasswordUtils.getPasswordHash(password, user.salt, pepper);
        return user.passwordHash === hash;
    }
}