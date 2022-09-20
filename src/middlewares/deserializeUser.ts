import { verifyJWT } from "../utils/jwt.utils";
import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { reIssueAccessToken } from "../services/session.service";

export async function deserializeUser(req: Request, res: Response, next: NextFunction) {
    const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '')
    const refreshToken = get(req, 'headers.x-refresh')
    if(!accessToken) return next();

    const { decoded, expired } = verifyJWT(accessToken);
    if(decoded) {
        res.locals.user = decoded;
        return next()
    }

    if(expired && refreshToken) {
        const newAccessToken = await reIssueAccessToken({ refreshToken });
        if(!newAccessToken) return next();
        //@ts-ignore
        const { decoded } = verifyJWT(newAccessToken);

        res.locals.user = decoded

        return next()
    }

    return next()
}