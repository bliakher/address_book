import { Request, Response, NextFunction } from 'express';
import { IContact } from '../contact_db/Contact';
import { ContactDatabase } from '../contact_db/ContactDatabase';
import { UserDatabase } from '../user_db/UserDatabase';
import { IContactRequest, ICreateResponse, IUserRequest } from './model';

export const createContact = async (req: Request, res: Response) => {
    const contactRequest: IContactRequest = req.body;
    const familyName = contactRequest.familyName ?? "";
    const givenName = contactRequest.givenName ?? "";
    const phoneNumber = contactRequest.phoneNumber ?? "";
    const address = contactRequest.address ?? "";
    const user = "example@gmail.com"; // ToDo: get user from token
    const newContact : IContact = {familyName, givenName, phoneNumber, address, user};

    const db = ContactDatabase.getDatabase();
    const newId = await db.createContact(newContact);

    const response: ICreateResponse = {success: newId !== undefined, id: newId};

    res.json(response);
    res.status(200); // ToDo: handle error situations
}

export const createUser = async (req: Request, res: Response) => {
    const userRequest: IUserRequest = req.body;
    // ToDo: validate email and password
    const email = userRequest.email ?? "";
    const password = userRequest.password ?? "";

    const db = UserDatabase.getDatabase();
    const hasUser = await db.hasUser(email);
    //console.log("has user " + email + ": ", hasUser);
    if (hasUser) {
        res.status(409);
        res.json({success: false, error: "User with email " + email + " already exists."});
        return;
    }
    const userId = await db.createUser(email, password);
    const success = userId !== undefined;
    const response = {success, id: userId?.toString()};

    if (success) {
        res.status(200);
    } else {
        res.status(400); // ToDo: check correct code
    }
    res.json(response);
}


