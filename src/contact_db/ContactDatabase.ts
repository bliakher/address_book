import * as firebase from 'firebase-admin';
import serviceAccount from '../keys/serviceAdminKey.json';
import { IContact } from './Contact';

/**
 * Name of collection in Firestore
 */
const CONTACT_COLLECTION = 'contacts';

/**
 * Account params for Firebase
 */
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

/**
 * Manager for a Firebase database that stores contact information
 */
export class ContactDatabase {

    private firestore: firebase.firestore.Firestore;
    constructor() {
    }

    public initialize(): void {
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccountParams)
        });
        this.firestore = firebase.firestore();
    }

    /**
     * Create a new contact in the database
     * @param newContact contact to create
     * @returns ID of the new contact or undefined on error
     */
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


export class ContactDatabaseMock extends ContactDatabase {

    readonly mockStore = new Map<string, IContact>();

    private index = 0;

    constructor() {
        super();
    }

    public initialize(): void { }

    public createContact(newContact: IContact): Promise<string> {
        const id = this.index.toString();
        this.mockStore.set(id, newContact);
        this.index++;
        return Promise.resolve(id);
    }
}