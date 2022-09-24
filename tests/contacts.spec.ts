import dotenv from "dotenv";
import { response, Response } from 'express'
import { DataSource } from "typeorm";
import { registerAppServices } from "../src/app";
import { ITokenData } from "../src/authentication/TokenData";
import { RequestWithToken } from "../src/authentication/TokenManager";
import { ContactDatabaseMock } from "../src/contact_db/ContactDatabase";
import { Controller } from "../src/rest_api/Controller";
import { IContactRequest } from "../src/rest_api/model";
import { ServiceContainer, ServiceContainerBuilder } from "../src/ServiceContainer";
import { getMockedResponseJson, mockContactDatabase, mockRequest, mockResponse, mockUserDataSource } from "./mock";

describe('/contacts', () => {
    let container: ServiceContainer;
    let mockUsers: DataSource;
    let mockContacts: ContactDatabaseMock;
    let res: Response;
    let controller: Controller;

    const testUser = {
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
        
        // create user who will request contact creation
        await container.userDatabase.createUser(testUser.email, testUser.password);
    });

    it('should return 200 on valid request', async () => {
        const body: IContactRequest = {
            familyName : "A",
            givenName : "B",
            phoneNumber : "1",
            address : "The Street 4"
        }
        const token: ITokenData = {user: testUser.email}
        const req = mockRequest({ body, token } as RequestWithToken);
        await controller.createContact(req, res);

        expect(res.status).toBeCalledWith(200);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(true);
        expect(responseBody.id).not.toBe(undefined);
    });

    it('should save new contact on valid request', async () => {
        const body: IContactRequest = {
            familyName : "A",
            givenName : "B",
            phoneNumber : "1",
            address : "The Street 4"
        }
        const token: ITokenData = {user: testUser.email}
        const req = mockRequest({ body, token } as RequestWithToken);
        await controller.createContact(req, res);

        const responseBody = getMockedResponseJson(res);
        const id = responseBody.id; // id of the created contact
        expect(id).not.toBe(undefined);
        expect(mockContacts.mockStore.has(id)).toBe(true); // contact id is in database
        
        const savedContact = mockContacts.mockStore.get(id);
        expect(savedContact).not.toBe(undefined);
        expect(savedContact.familyName).toBe(body.familyName); // check that all fields are saved correctly
        expect(savedContact.givenName).toBe(body.givenName);
        expect(savedContact.phoneNumber).toBe(body.phoneNumber);
        expect(savedContact.address).toBe(body.address);  
        expect(savedContact.user).toBe(testUser.email);
    });

    it('should return 400 bad request on incorrect name format', async () => {
        const body: IContactRequest = {
            familyName : "9999999",
            givenName : "B",
            phoneNumber : "1",
            address : "The Street 4"
        }
        const token: ITokenData = {user: testUser.email}
        const req = mockRequest({ body, token } as RequestWithToken);
        await controller.createContact(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });

    it('should return 400 bad request on incorrect phone number format', async () => {
        const body: IContactRequest = {
            familyName : "A",
            givenName : "B",
            phoneNumber : "not phone number",
            address : "The Street 4"
        }
        const token: ITokenData = {user: testUser.email}
        const req = mockRequest({ body, token } as RequestWithToken);
        await controller.createContact(req, res);

        expect(res.status).toBeCalledWith(400);
        const responseBody = getMockedResponseJson(res);
        expect(responseBody.success).toBe(false);
    });

});