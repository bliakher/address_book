import { Request, Response } from 'express'
import { DataSource } from 'typeorm';
import { registerAppServices } from '../src/app';
import { TokenManager } from '../src/authentication/TokenManager';
import { ContactDatabaseMock } from '../src/contact_db/ContactDatabase';
import { Controller } from '../src/rest_api/Controller';
import { IUserRequest } from '../src/rest_api/model';
import { ServiceContainer, ServiceContainerBuilder } from '../src/ServiceContainer';
import { mockContantDatabase, mockRequest, mockResponse, mockUserDataSource } from './mock';
import { respond } from '../src/rest_api/responses';


describe('/register', () => {
    let container: ServiceContainer;
    let mockUsers: DataSource;
    let mockContacts: ContactDatabaseMock;
    let res: Response;
    let controller: Controller;

    beforeEach(async () => {
        const builder = new ServiceContainerBuilder();
        registerAppServices(builder);
        mockUsers = mockUserDataSource(builder);
        mockContacts = mockContantDatabase(builder);
        res = mockResponse();

        container = await builder.build();
        controller = new Controller(container);
    });

    it('should return valid token on registration', async () => {
        const body: IUserRequest = {
            email: 'a@b',
            password: '1234'
        }
        const req = mockRequest({ body });
        await controller.createUser(req, res);

        expect(res.status).toBeCalledWith(200);

        const returnedBody = (res.json as any as jest.Mock<void, [ReturnType<typeof respond.withAuthToken>]>).mock.calls[0][0];
        const returnedSuccess = returnedBody.success;
        const verified = await container.tokenManager.decodeVerify(returnedBody.token);

        expect(returnedSuccess).toBe(true);
        expect(verified).not.toBe(undefined);
    })


});
