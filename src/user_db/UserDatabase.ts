import "reflect-metadata";
import { DataSource } from "typeorm";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User } from "./User";

/**
 * Manager for a Postgres database that stores user account info
 */
export class UserDatabase {

    constructor(
        private dataSource: DataSource,
    ) { }

    private assertInitialized() {
        if (!this.dataSource.isInitialized) {
            throw Error("User data source must be initialized first.");
        }
    }

    /**
     * Create new user account
     * @param email User email
     * @param password User password
     * @returns Created user of undefined on error
     */
    public async createUser(email: string, password: string): Promise<User | undefined> {
        this.assertInitialized();
        const user = new User();
        user.email = email;
        user.salt = PasswordUtils.generateRandomSalt();
        user.passwordHash = PasswordUtils.getPasswordHash(password, user.salt, process.env.PEPPER);
        try {
            await this.dataSource.manager.save(user);
            console.log("New user created with id", user.id);
            return user;
        } catch (error) {
            console.log(error);
            return undefined;
        }
    }

    /**
     * Check if user account exists
     * @param email User email
     * @returns if account exists
     */
    public async hasUser(email: string): Promise<boolean> {
        this.assertInitialized();
        if (!email) return false;
        const user = await this.getUser(email);
        return user !== null;
    }

    /**
     * Get user account by email
     * @param email User email
     * @returns Retrieved account or undefined if not found
     */
    public async getUser(email: string): Promise<User | undefined> {
        this.assertInitialized();
        const userRep = this.dataSource.getRepository(User);
        return await userRep.findOne({ where: { email: email } });
    }

}