import { Request, Response, NextFunction } from 'express';
import { IContact } from '../contact_db/Contact';
import { ContactDatabase } from '../contact_db/ContactDatabase';
import { IContactRequest } from './model';

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

    res.json({success: newId !== undefined, id: newId});
    res.status(200);
}