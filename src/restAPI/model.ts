
export interface IContactRequest {
    familyName: string;
    givenName: string;
    phoneNumber: string;
    address: string;
}

export interface IUserRequest {
    email: string;
    password: string;
}

export interface ICreateResponse {
    success: boolean;
    id: string;
}