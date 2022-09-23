import "reflect-metadata";
import { DataSource } from "typeorm";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User } from "./User";

/**
 * Manager for a Postgres database that stores user account info
 */
export class UserDatabase {

    private static instance: UserDatabase;
    private dataSource: DataSource;
    private initialized: boolean;
    private constructor() {
        this.dataSource = new DataSource({
            type: "postgres",
            host: process.env.DB_SERVICE,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [ User ],
            synchronize: true,
            logging: false,
        });
        this.initialized = false;
    }

    /**
     * Connects to the database
     * This method should be called before calling other methods
     */
    public static async initialize() {
        if (!UserDatabase.instance) {
            UserDatabase.instance = new UserDatabase();
            try {
                await UserDatabase.instance.dataSource.initialize();
                UserDatabase.instance.initialized = true;
                console.log("user db connected");
            } catch(err) {
                console.log(err);
            }
        }
    }
    /**
     * get database manager instance
     * @returns 
     */
    public static getDatabase() {
        if (!UserDatabase.instance || !UserDatabase.instance.initialized) {
            throw Error("User database must be initialized first.");
        }
        return UserDatabase.instance;
    }

    /**
     * Create new user account
     * @param email User email
     * @param password User password
     * @returns Created user of undefined on error
     */
    public async createUser(email: string, password: string): Promise<User | undefined> {
        if (!this.initialized) {
            throw Error("User database must be initialized first.");
        }
        const user = new User();
        user.email = email;
        user.salt = PasswordUtils.generateRandomSalt();
        user.passwordHash = PasswordUtils.getPasswordHash(password, user.salt, process.env.PEPPER);
        try {
            await this.dataSource.manager.save(user);
            console.log("New user created with id", user.id);
            return user;
        } catch(error) {
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
        if (!this.initialized) {
            throw Error("User database must be initialized first.");
        }
        const user = await this.getUser(email);
        return user !== null;
    }
    /**
     * Get user account by email
     * @param email User email
     * @returns Retrieved account or undefined if not found
     */
    public async getUser(email: string): Promise<User | undefined> {
        if (!this.initialized) {
            throw Error("User database must be initialized first.");
        }
        const userRep = this.dataSource.getRepository(User);
        return await userRep.findOne({ where: { email: email } });
    } 

}