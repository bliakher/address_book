# address_book

Backend of an app to store contact information

App is hosted on [Azure](http://strv-addressbook-golubeva.westeurope.azurecontainer.io/).

### Rest API

API allows to:
- register new user account
- login registered user
- add new contact for authenticated user

##### Register new user
POST /register
```
{
    "email" : "",
    "password" : ""
}
```

**Responses:**

- successfull registration:
    - logins user and returns authentication token 

```
{
    "success": true,
    "token": "..."
}
```

- errors:
    - returns an error message
    - possible errors:
        - user with email already exists - 400
        - email or password has incorrect format - 400
        - database error - 500

```
{
    "success": false,
    "error": "..."
}
```



##### Login existing user
POST /login
```
{
    "email" : "",
    "password" : ""
}
```

##### Create new contact for authenticated user
POST /contacts
```
{
    "familyName" : "",
    "givenName" : "",
    "phoneNumber" : "",
    "address" : ""
}
```

### Project structure

App uses the Express.js library.

#### API

#### Authentication

JWT tokens are used for authentication. After password correctnes is checked in login, app creates a JWT token, that contains user email. 
Token is valid for 15 minutes.

Passwords are saved as hashes with salt unique per user and pepper, which is common for all users.

#### Databases

- contact info - Firestore from Firebase
    - directory `contact_db`

- user account info - Postgress in a container
    - accessed with TypeORM   
    - directory `user_db`

### Tests

Jest framework is used for testing. Test are located in the `test` directory. To run tests:

```
npm run build
npm run test
```


### Possible extensions
- CI/CD for container build and deployment
- SSL - user passwords are now sent over HTTP
