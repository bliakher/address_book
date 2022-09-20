import * as firebaseAdmin from 'firebase-admin';
import serviceAccount from '../keys/serviceAdminKey.json';
import { IContact } from './Contact';

const CONTACT_COLLECTION  = 'contacts';

const serviceAccountParams = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url
}

export class ContactDatabase {

    private static instance: ContactDatabase;

    private firestore: any;
    private constructor() {
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccountParams)
        });
        this.firestore = firebaseAdmin.firestore();
    }

    public static getDatabase(): ContactDatabase {
        if (!ContactDatabase.instance) {
            ContactDatabase.instance = new ContactDatabase();
        }
        return ContactDatabase.instance;
    }

    public async createContact(newContact: IContact): Promise<string | undefined> {
        const response = await this.firestore.collection(CONTACT_COLLECTION).add(newContact);
        if (response.id) {
            console.log("created contact with ID ", response.id);
        } else {
            console.log("error when creating contact");
        }
        return response.id;
    }
}