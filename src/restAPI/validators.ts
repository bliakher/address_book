import { IContactRequest, IUserRequest } from "./model";

type Validator = (string) => boolean;

export const validateName: Validator= (name: string) => {
    return /^[a-zA-Z]*$/.test(name);
}

export const validatePhoneNumber: Validator = (phone: string) => {
    return /^\+{0,1}[0-9]*$/.test(phone);
}

export const validateEmail: Validator = (email: string) => {
    return /^[^\/]*@[^\/]*$/.test(email);
}

export const validateAddress: Validator = (address: string) => {
    return /^[a-zA-Z0-9,/]*$/.test(address);
}

export const validateContactRequest: (IContactRequest) => boolean  = (reqData: IContactRequest) => {
    if (!reqData.familyName || !validateName(reqData.familyName)) return false;
    if(!reqData.givenName || !validateName(reqData.givenName)) return false;
    if(!reqData.phoneNumber || !validatePhoneNumber(reqData.phoneNumber)) return false;
    if(!reqData.address || !validateAddress(reqData.address)) return false;
    return true;
}

export const validateUserRequest: (IUserRequest) => boolean = (reqData: IUserRequest) => {
    return reqData.email && validateEmail(reqData.email) && reqData.password && reqData.password !== "";
}