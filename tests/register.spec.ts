import dotenv from 'dotenv';
import { Response } from 'express'
import { DataSource } from 'typeorm';
import { registerAppServices } from '../src/app';
import { TokenManager } from '../src/authentication/TokenManager';
import { ContactDatabaseMock } from '../src/contact_db/ContactDatabase';
import { Controller } from '../src/rest_api/Controller';
import { IUserRequest } from '../src/rest_api/model';
import { ServiceContainer, ServiceContainerBuilder } from '../src/ServiceContainer';
import { mockContactDatabase, mockRequest, mockResponse, mockUserDataSource, getMockedResponseJson } from './mock';
import { User } from '../src/user_db/User';


describe('/register', () => {
    let container: ServiceContainer;
    let mockUsers: DataSource;
    let mockContacts: ContactDatabaseMock;
    let res: Response;
    let controller: Controller;

    beforeAll(() => {
        dotenv.config();
    })

    beforeEach(async () => {
        const builder = new ServiceContainerBuilder();
        registerAppServices(builder);
        mockUsers = mockUserDataSource(builder);
        mockContacts = mockContactDatabase(builder);
        res = mockResponse();

        container = await builder.build();
        controller = new Controller(container);
    });

    it('should return valid token on registration', async () => {
        const body: IUserRequest = {
            email: 'a@b',
            password: '1234'
        };
        const req = mockRequest({ body });
        await controller.createUser(req, res);

        expect(res.status).toBeCalledWith(200);

        const responseBody = getMockedResponseJson(res);
        const returnedSuccess = responseBody.success;
        const verified = await container.tokenManager.decodeVerify(responseBody.token);

        expect(returnedSuccess).toBe(true);
        expect(verified).not.toBe(undefined);
    });

    it('should save user data to database', async () => {
        const body: IUserRequest = {
            email: 'a@b',
            password: '1234'
        };
        const req = mockRequest({ body });
        await controller.createUser(req, res);

        const createdUsers = await mockUsers.getRepository(User).find();
        expect(createdUsers.length).toBe(1);
        expect(createdUsers[0].email).toBe(body.email);

    });

    it('should return 400 bad request on missing email', async () => {
        const body = {
            password: '1234'
        };
        const req = mockRequest({ body });
        await controller.createUser(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });

    it('should return 400 bad request on invalid email format', async () => {
        const body = {
            email: 'i like cats',
            password: '1234'
        };
        const req = mockRequest({ body });
        await controller.createUser(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });

    it('should return 400 on email conflict', async () => {
        const user = {
            email: 'test@test.com',
            password: '12345'
        };

        await container.userDatabase.createUser(user.email, 's3cr3t');

        const req = mockRequest({ body: user });
        await controller.createUser(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });
});

