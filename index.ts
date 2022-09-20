import express from 'express';
import { createContact } from './restAPI/endpoints';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/contacts', createContact);

app.listen(port, () => {
    console.log("Server running on port " + port);
});



// const firebase_admin = require('firebase-admin');
// const service_account = require('./keys/serviceAdminKey.json');

// firebase_admin.initializeApp({
//     credential: firebase_admin.credential.cert(service_account)
// });

// const db = firebase_admin.firestore();