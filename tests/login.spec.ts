import dotenv from "dotenv";
import { Response } from 'express'
import { DataSource } from "typeorm";
import { registerAppServices } from "../src/app";
import { ContactDatabaseMock } from "../src/contact_db/ContactDatabase";
import { Controller } from "../src/rest_api/Controller";
import { ILoginRequest } from "../src/rest_api/model";
import { ServiceContainer, ServiceContainerBuilder } from "../src/ServiceContainer";
import { getMockedResponseJson, mockContactDatabase, mockRequest, mockResponse, mockUserDataSource } from "./mock";


describe('/login', () => {
    let container: ServiceContainer;
    let mockUsers: DataSource;
    let mockContacts: ContactDatabaseMock;
    let res: Response;
    let controller: Controller;

    const loginUser: ILoginRequest = {
        email: 'a@b',
        password: '1234'
    }

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

        // create user to test login on
        await container.userDatabase.createUser(loginUser.email, loginUser.password);
    });


    it('should return auth token for valid login', async () => {
        const req = mockRequest({ body: loginUser });
        await controller.loginUser(req, res);

        expect(res.status).toBeCalledWith(200);

        const responseBody = getMockedResponseJson(res);
        const verified = await container.tokenManager.decodeVerify(responseBody.token);

        expect(responseBody.success).toBe(true);
        expect(verified).not.toBe(undefined);

    });

    it('should return 401 unathorized for incorrect password', async () => {
        const body: ILoginRequest = {
            email: loginUser.email,
            password: 'incorrect password'
        };
        const req = mockRequest({ body });
        await controller.loginUser(req, res);

        expect(res.status).toBeCalledWith(401);

        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);

    });

    it('should return 401 unathorized for incorrect email', async () => {
        const body: ILoginRequest = {
            email: 'user@incorrect.com',
            password: loginUser.password,
        };
        const req = mockRequest({ body });
        await controller.loginUser(req, res);

        expect(res.status).toBeCalledWith(401);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);

    });

    it('should return 404 for missing password', async () => {
        const req = mockRequest({ body: {
            email: 'user@email.com'
        } });
        await controller.loginUser(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });
    
    it('should return 404 for missing email', async () => {
        const req = mockRequest({ body: {
            password: 'secret',
        } });
        await controller.loginUser(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });

});