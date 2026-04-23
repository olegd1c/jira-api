import * as crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const ivLength = 16;

const getSecretKey = (secret: string) => {
    return crypto.createHash('sha256').update(String(secret)).digest('base64').substring(0, 32);
};

export const encrypt = (text: string, secret: string) => {
    if (!text) return '';
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, getSecretKey(secret), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text: string, secret: string) => {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, getSecretKey(secret), iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return text;
    }
};
