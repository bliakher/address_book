import { Pool } from "pg";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { PasswordUtils } from "../utils/PasswordUtils";
import { User } from "./User";

export class UserDatabase {

    private static instance: UserDatabase;
    private dataSource: DataSource;
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
        })
    }

    public static async initialize() {
        if (!UserDatabase.instance) {
            UserDatabase.instance = new UserDatabase();
            try {
                await UserDatabase.instance.dataSource.initialize();
                console.log("user db connected");
            } catch(err) {
                console.log(err);
            }
        }
    }
    public static getDatabase() {
        return UserDatabase.instance;
    }

    public async createUser(email: string, password: string): Promise<number | undefined> {
        const user = new User();
        user.email = email;
        user.salt = PasswordUtils.generateRandomSalt();
        user.passwordHash = PasswordUtils.getPasswordHash(password, user.salt, process.env.PEPPER);
        try {
            await this.dataSource.manager.save(user);
            console.log("New user created with id", user.id);
            return user.id;
        } catch(error) {
            console.log(error);
            return undefined;
        }
    }

    public async hasUser(email: string): Promise<boolean> {
        const user = this.getUser(email);
        // console.log("found user", user);
        return user !== null;
    }

    public async getUser(email: string): Promise<User | undefined> {
        const userRep = this.dataSource.getRepository(User);
        return await userRep.findOne({ where: { email: email } });
    } 

}