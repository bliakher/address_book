# address_book

Backend of an app to store contact information

App is hosted on Azure: 

### Rest API

Rest API is documented using OpenAPI [here]().

Summary:

##### Register new user
POST /register
{
    "email" : "",
    "password" : ""
}

##### Login existing user
POST /login
{
    "email" : "",
    "password" : ""
}

##### Create new contact for authenticated user
POST /contacts
{
    "familyName" : "",
    "givenName" : "",
    "phoneNumber" : "",
    "address" : ""
}


### Project structure

### Possible extensions
- CI/CD for container build and deployment
- SSL - user passwords are now sent over HTTP
