import dotenv from "dotenv";
import { response, Response } from 'express'
import { DataSource } from "typeorm";
import { registerAppServices } from "../src/app";
import { ITokenData } from "../src/authentication/TokenData";
import { RequestWithToken, TokenManager } from "../src/authentication/TokenManager";
import { ContactDatabaseMock } from "../src/contact_db/ContactDatabase";
import { Controller } from "../src/rest_api/Controller";
import { IContactRequest } from "../src/rest_api/model";
import { ServiceContainer, ServiceContainerBuilder } from "../src/ServiceContainer";
import { getMockedResponseJson, mockContactDatabase, mockRequest, mockResponse, mockUserDataSource } from "./mock";
import { User } from '../src/user_db/User';
import jwt from 'jsonwebtoken';

describe('authenticationMiddleware', () => {
    let container: ServiceContainer;
    let mockUsers: DataSource;
    let mockContacts: ContactDatabaseMock;
    let res: Response;
    let controller: Controller;
    let authenticationMw: typeof container.tokenManager.authenticationMiddleware;
    let token: string;

    const testUser = {
        email: 'user@example.com',
        password: 'password',
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
        authenticationMw = container.tokenManager.authenticationMiddleware.bind(container.tokenManager);
        const user = await container.userDatabase.createUser(testUser.email, testUser.password);
        token = container.tokenManager.createToken(user);
    });

    it('should call next for valid JWT token', async () => {
        const next = jest.fn();
        const req = mockRequest({
            headers: {
                authorization: 'Bearer ' + token
            }
        });

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(1);
    });


    it('should return 401 for garbage JWT token', async () => {
        const next = jest.fn();
        const req = mockRequest({
            headers: {
                authorization: 'Bearer ' + token + "1235678"
            }
        });

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(0);
        expect(res.status).toBeCalledWith(401);
        expect(getMockedResponseJson(res).success).toBe(false)
    });

    it('should return 401 for missing header', async () => {
        const next = jest.fn();
        const req = mockRequest({});

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(0);
        expect(res.status).toBeCalledWith(401);
        expect(getMockedResponseJson(res).success).toBe(false)
    });
    
    it('should return 401 for bad signature', async () => {
        const next = jest.fn();
        const req = mockRequest({
            headers: {
                authorization: 'Bearer ' + jwt.sign({ user: testUser.email }, 'secret', { expiresIn: 60 })
            }
        });

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(0);
        expect(res.status).toBeCalledWith(401);
        expect(getMockedResponseJson(res).success).toBe(false)
    });

    it('should return 401 for expired JWT token', async () => {
        const next = jest.fn();

        const req = mockRequest({
            headers: {
                authorization: 'Bearer ' + jwt.sign({ user: testUser.email }, process.env.TOKEN_SECRET, { expiresIn: -60 })
            }
        });

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(0);
        expect(res.status).toBeCalledWith(401);
        expect(getMockedResponseJson(res).success).toBe(false)
    });


    it('should return 401 for JWT of invalid user', async () => {
        const next = jest.fn();
        const fakeUser = new User();
        fakeUser.email = 'fake@user.com';
        token = container.tokenManager.createToken(fakeUser);

        const req = mockRequest({
            headers: {
                authorization: 'Bearer ' + token
            }
        });

        await authenticationMw(req, res, next);
        expect(next).toBeCalledTimes(0);
        expect(res.status).toBeCalledWith(401);
        expect(getMockedResponseJson(res).success).toBe(false)
    });
});