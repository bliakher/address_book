import { Md5 } from 'ts-md5';
import { sha512 } from 'sha512-crypt-ts';

/**
 * Class for utilities connected to password storing
 */
export class PasswordUtils {

    /**
     * Generate random salt
     * Takes the first 10 characters of the MD5 hash of a pseudorandom nuber
     * @returns salt with 10 characters
     */
    public static generateRandomSalt(): string {
        const rndNum = Math.random();
        return Md5.hashStr(rndNum.toString()).slice(0,10);
    }

    /**
     * Generates a hash from password
     * @param password Password to encode
     * @param salt Salt - unique for each password
     * @param pepper Pepper - common between all passwords
     * @returns Password hash
     */
    public static getPasswordHash(password: string, salt: string, pepper: string) {
        return sha512.crypt(password + pepper, salt);
    }
}