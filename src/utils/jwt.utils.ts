import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import config from 'config';
import { logger } from './logger';

const privateKey = config.get<string>('privateKey');
const publicKey = config.get<string>('publicKey')

const signJWT = (object: object, options?: jwt.SignOptions | undefined) => {
    return jwt.sign(object, privateKey, {
        ...(options && options),
        algorithm: 'RS256'
    })
}

const verifyJWT = (token: string) => {
    try {
        const decoded = jwt.verify(token, publicKey);
        return {
            decoded,
            valid: true,
            expired: false
        }
    } catch(err) {
        logger.error((err as JsonWebTokenError).message)
        return {
            valid: false,
            expired: (err as JsonWebTokenError).message.includes('jwt expired'),
            decoded: null
        }
    }
}

export {
    signJWT,
    verifyJWT
}

