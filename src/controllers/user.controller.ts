import { createUserInput } from "../schemas/user.schema";
import { logger } from "../utils/logger";
import { createUser, getAllUsers } from "../services/user.service";
import { Request, Response } from "express";

async function createUserHandler(req: Request<{}, {}, createUserInput>, res: Response) {
    try {
        const user = await createUser(req.body)
        res.status(201).json(user)
    } catch(err) {
        logger.error(err)
        res.sendStatus(409)
    }
}

async function getAllUsersHandler(req: Request, res: Response) {
    try {
        const users = await getAllUsers();
        if(!users || !users?.length) return res.status(204).json({ message: 'No users available'})

        res.json(users)
    } catch(err) {
        logger.error(err)
        res.status(400).json({ message: 'Cannot get users'})
    }
}

export {
    createUserHandler,
    getAllUsersHandler
}