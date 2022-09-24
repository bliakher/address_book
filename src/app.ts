import { DataSource } from 'typeorm';
import { ContactDatabase } from './contact_db/ContactDatabase';
import { ServiceContainer, ServiceContainerBuilder } from './ServiceContainer';
import { User } from './user_db/User';
import { UserDatabase } from './user_db/UserDatabase';
import { Express } from 'express';
import express from 'express'
import { Controller } from './rest_api/Controller';
import { TokenManager } from './authentication/TokenManager';


export function registerAppServices(builder: ServiceContainerBuilder) {

    builder.userDataSourceFactory = () =>
        new DataSource({
            type: 'postgres',
            host: process.env.DB_SERVICE,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [User],
            synchronize: true,
            logging: false,
        });
    builder.userDatabaseFactory = (container) => {
        return new UserDatabase(container.userDataSource);
    };
    builder.contactDatabaseFactory = () => new ContactDatabase();
    builder.tokenManagerFactory = (container) => new TokenManager(container);
}


export function configureExpress(container: ServiceContainer): Express {
    const app = express();
    app.use(express.json());
    const controller = new Controller(container);

    const authenticationMiddleware = container.tokenManager.authenticationMiddleware.bind(container.tokenManager);
    
    // create a new contact, only for authenticated users
    app.post('/contacts', authenticationMiddleware, controller.createContact.bind(controller));

    // register a new user account
    app.post('/register', controller.createUser.bind(controller));

    // login existing user
    app.post('/login', controller.loginUser.bind(controller));

    return app;
}
