import { Pool } from "pg";

export class UserDatabase {

    private static instance: UserDatabase;
    private pool: Pool;
    private constructor() {
        this.pool = new Pool({
            host: process.env.DB_SERVICE,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || "3004")
          });
    }
    public static getDatabase() {
        if (!UserDatabase.instance) {
            UserDatabase.instance = new UserDatabase();
        }
        return UserDatabase.instance;
    }

    public async connect() {
        try {
            await this.pool.connect();
            console.log("db connected");
          } catch (err) {
            console.log(err);
          }
    }
}