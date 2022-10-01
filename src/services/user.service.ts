import config from 'config'
import { omit } from "lodash";
import { FilterQuery, LeanDocument, QueryOptions, UpdateQuery } from "mongoose";
import Session, { SessionDocument } from "../models/session.model";
import User, { UserInput, UserDocument} from "../models/user.model";
import { logger } from '../utils/logger';
import axios from 'axios'
import qs from 'qs'

async function createUser(input: UserInput) {
    const user = await User.create(input);
    //Return user without password when success
    return omit(user.toJSON(), 'password')
}

async function validatePassword({ email, password }: Omit<UserInput, 'name'>) {
    const user = await User.findOne({ email }).exec();
    if(!user) return false

    const isValid = await user.comparePassword(password)

    if(!isValid) return false;

    return omit(user.toJSON(), 'password')
}

async function findUser(query: FilterQuery<UserDocument>) : Promise<LeanDocument<UserDocument> | null> {
    return User.findOne(query).lean().exec()
}

async function findSessions(query: FilterQuery<SessionDocument>) : Promise<LeanDocument<SessionDocument>[]> {
    return Session.find(query).lean().exec()
}

async function getAllUsers() {
    return await User.find().select('-password').exec()
}

interface GoogleOAuthTokensResult {
    access_token: string
    refresh_toke: string
    expires_in: Number
    scope: string
    id_token: string
}

async function getGoogleOAuthTokens({ code }: { code: string}) : Promise<GoogleOAuthTokensResult> {
    const url = "https://oauth2.googleapis.com/token"
    const values = {
        code,
        client_id: config.get<string>("clientId"),
        client_secret: config.get<string>("secret"),
        redirect_uri: config.get<string>("redirectUri"),
        grant_type: 'authorization_code'
    }
    try {
        const res = await axios.post<GoogleOAuthTokensResult>(url, qs.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        return res.data
    } catch(err: any) {
        logger.error(err.message, 'Error getting Google oauth tokens')
        throw new Error(err.message) 
    }
}

interface GoogleUserResult {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
    locale: string
}

async function getGoogleUser({ id_token, access_token }: Pick<GoogleOAuthTokensResult, 'id_token' | 'access_token'>): Promise<GoogleUserResult> {
    try {
        const res = await axios.get<GoogleUserResult>(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`
                }
            }
        )

        return res.data
    } catch(err: any) {
        logger.error('Error getting user from Google')
        throw new Error(err.message)
    }
}

async function findUserAndUpdate(query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>, options: QueryOptions = {}) {
    return User.findOneAndUpdate(query, update, options)
}

export interface GitHubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: null;
    blog: string;
    location: string;
    email: null;
    hireable: null;
    bio: null;
    twitter_username: null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: Date;
    updated_at: Date;
  }

async function getGithubUser({ code }: { code: string }): Promise<GitHubUser> {
    const GITHUB_CLIENT_ID = config.get<string>('githubClientId')
    const GITHUB_CLIENT_SECRET = config.get<string>('githubSecret')

    try {
        const githubToken = await axios.post(
            `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
        ).then(res => res.data).catch(err => { throw err })

        const decoded = qs.parse(githubToken);
        const accessToken = decoded.access_token
        return axios.get<GitHubUser>(
            "https://api.github.com/user",
            { headers: { Authorization: `Bearer ${accessToken}`}}
        ).then(res => res.data).catch(err => { throw err })
    } catch(err) {
        console.error(`Error getting user from GitHub`);
        throw err
    }
}

export {
    createUser,
    validatePassword,
    findUser,
    getAllUsers,
    findSessions,
    getGoogleOAuthTokens,
    getGoogleUser,
    findUserAndUpdate,
    getGithubUser
}