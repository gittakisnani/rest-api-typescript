import { signJWT, verifyJWT } from "../utils/jwt.utils";
import Session, { SessionDocument } from "../models/session.model";
import { findUser } from "./user.service";
import { FilterQuery, FlattenMaps, UpdateQuery } from "mongoose";
import { get } from 'lodash'
import config from 'config' 

async function createSession(userId: string, userAgent: string): Promise<FlattenMaps<SessionDocument>> {
    const session = await Session.create({user: userId, userAgent})

    return session.toJSON()
}

async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) : Promise<UpdateQuery<SessionDocument>> {
    return Session.updateOne(query, update).lean().exec()
}

async function reIssueAccessToken({ refreshToken } : { refreshToken: string }) : Promise<boolean | string > {
    const { decoded } = verifyJWT(refreshToken);
    if(!decoded || !get(decoded, 'session')) return false;

    const session = await Session.findById(get(decoded, 'session')).lean().exec();
    if(!session || !session.valid) return false;

    const user = await findUser({ id: session.user });
    if(!user) return false;

    const newAccessToken = signJWT({
        ...user, session: session._id
    }, {expiresIn: config.get<string>('accessTokenTtl')})

    return newAccessToken
}   

export {
    createSession,
    updateSession,
    reIssueAccessToken,
}