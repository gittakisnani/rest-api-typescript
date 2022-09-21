import { signJWT, verifyJWT } from "../utils/jwt.utils";
import { createSession, updateSession } from "../services/session.service";
import { validatePassword, findSessions, getGoogleOAuthTokens, getGoogleUser, findUserAndUpdate, getGithubUser, GitHubUser } from '../services/user.service'
import { Response, Request, CookieOptions } from "express";
import config from 'config'
import { SessionDocument } from "../models/session.model";
import { LeanDocument } from "mongoose";
import { logger } from "../utils/logger";
import { get } from "lodash";
import User from "../models/user.model";
import { sign, verify } from "jsonwebtoken";


const cookiesOptions: CookieOptions = {
    maxAge: 1000 * 60 * 15,
    httpOnly: true,
    sameSite: 'none',
    secure: false
}

async function createSessionHandler(req: Request, res: Response) {
    const user = await validatePassword(req.body);
    if(!user) return res.status(404).json({ message: 'User not found'})

    const session = await createSession(user._id, req.get("user-agent") || '')
    if(!session) return res.status(400).json({ message: 'Cannot create new session.'})

    const accessToken = signJWT({
        ...user, session: session._id
        }, 
        { expiresIn: config.get<string>('accessTokenTtl')}
    )

    const refreshToken = signJWT({
        ...user, session: session._id
    }, {expiresIn: config.get<string>('refreshTokenTtl')})

    res.json({ accessToken, refreshToken })
}

async function getUserSessionsHandler(req: Request, res: Response) {
    const user = res.locals.user;
    const userSessions = await findSessions({ user: user._id, valid: true })
    res.json({ userSessions })
}

async function deleteUserSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;
    await updateSession({ _id: sessionId }, { valid: false })
    res.json({
        accessToken: false,
        refreshToken: false
    })
}

async function deleteAllUserSessions(req: Request, res: Response) {
    const user = res.locals.user._id;
    const userSessions = await findSessions({ user });
    if(!userSessions || !userSessions.length) res.sendStatus(204)

    userSessions.forEach(async ({ _id }) => {
        await updateSession({ _id }, { valid: false})
    })

    res.status(204).json({ message: 'Sessions cleared successfully'})
}

async function googleOAuthHandler(req: Request, res:Response) {
    // We get code form query string.
    const code = req.query.code as string;

    try {
        //Get ID & accessToken from the code
        const { access_token, id_token } = await getGoogleOAuthTokens({ code });

        // Get user with tokens
        const googleUser = await getGoogleUser({ id_token, access_token})

        if(!googleUser.verified_email) return res.status(403).json({ message: 'User Email account is not verified'})

        const user = await findUserAndUpdate(
            { email: googleUser.email },
            {
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture 
            },
            {
                new: true,
                upsert: true
            }
        )

        const session = await createSession(user?._id, req.get("user-agent") || "")

        // Create accessToken
        const accessToken = signJWT(
            {...user?.toJSON(), session: session._id },
            { expiresIn: config.get<string>('accessTokenTtl')}
        )

        const refreshToken = signJWT(
            { ...user?.toJSON(), session: session._id },
            { expiresIn: config.get<string>('refreshTokenTtl')}
        )

        res.cookie('accessToken', accessToken, cookiesOptions)
        res.cookie('refreshToken', refreshToken, {...cookiesOptions, maxAge: 3.154e10 })

        res.redirect(config.get<string>('origin'))
    } catch(err: any) {
        logger.error(err.message, 'Error Google OAuth')
        return res.redirect(`${config.get("origin")}/oauth/error`)
    }
}

async function githubOAuthHandler(req: Request, res: Response) {
    const code = get(req, "query.code")
    const path = get(req, "query.path", "/")

    if(!code) {
        return res.status(400).json({ message: "Could not authenticate with github"})
    }

    const gitHubUser = await getGithubUser({ code });

    const token = sign(gitHubUser, 'shhhh')

    res.cookie(config.get<string>('cookieName'), token, {domain: 'localhost', maxAge: 1000 * 60 * 24 })

    res.redirect(`http://localhost:3000${path}`)
}

async function getCurrentGithubUser(req: Request, res: Response) {
    const cookie = get(req, `cookies[${config.get<string>('cookieName')}]`)
    try {
        const user = verify(cookie, 'shhhh')

        return res.status(200).json(user)
    } catch(err) {
        return res.send(null)
    }
}


export {
    createSessionHandler, 
    getUserSessionsHandler, 
    deleteUserSessionHandler, 
    deleteAllUserSessions,
    googleOAuthHandler,
    githubOAuthHandler,
    getCurrentGithubUser
}