
/**
 * Body of request to create new contact
 */
export interface IContactRequest {
    familyName: string;
    givenName: string;
    phoneNumber: string;
    address: string;
}
/**
 * Body of request to register new user
 */
export interface IUserRequest {
    email: string;
    password: string;
}

/**
 * Body of request to login user
 */
export interface ILoginRequest {
    email: string;
    password: string;
}
/**
 * Body of response to a request with errors
 */
export interface IErrorResponse {
    success: false;
    error: string;
}
