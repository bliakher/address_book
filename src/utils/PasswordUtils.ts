import {Md5} from 'ts-md5';
import { sha512 } from 'sha512-crypt-ts';

export class PasswordUtils {

    public static generateRandomSalt(): string {
        const rndNum = Math.random();
        return Md5.hashStr(rndNum.toString()).slice(0,15);
    }

    public static getPasswordHash(password: string, salt: string, pepper: string) {
        return sha512.crypt(password + pepper, salt);
    }
}