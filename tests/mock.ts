import { Request, Response } from 'express'
import { DataSource } from 'typeorm';
import { ContactDatabaseMock } from '../src/contact_db/ContactDatabase';
import { ServiceContainerBuilder } from '../src/ServiceContainer';
import { User } from '../src/user_db/User';
import { respond } from '../src/rest_api/responses';

export function mockRequest(requestPart: Partial<Request>): Request {
    const req: Partial<Request> = {
        headers: {},
        ...requestPart
    };
    return req as any;
}

export function mockResponse(responsePart: Partial<Response> = {}): Response {
    const res: Partial<Response> = {
        ...responsePart,
        status: jest.fn(),
        json: jest.fn(),
    };
    return res as any;
}

export function getMockedResponseJson(res: Response) {
    return (res.json as any).mock.calls[0][0];
}

export function mockUserDataSource(builder: ServiceContainerBuilder): DataSource {
    const ds = new DataSource({
        type: 'better-sqlite3',
        database: ':memory:',
        dropSchema: true,
        entities: [User],
        synchronize: true,
    });
    builder.userDataSourceFactory = () => ds;
    return ds;
}

export function mockContactDatabase(builder: ServiceContainerBuilder): ContactDatabaseMock {
    const db = new ContactDatabaseMock()
    builder.contactDatabaseFactory = () => db;
    return db;
}

