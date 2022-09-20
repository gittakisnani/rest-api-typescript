import { Request, Response, NextFunction  } from "express";
import { AnyZodObject, ZodError } from "zod";
import { logger } from "../utils/logger";

const validate = (schema: AnyZodObject) => 
    (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body:  req.body,
            params: req.params,
            query: req.query
        })

        next()
    } catch(error) {
        const err = error as ZodError
        logger.error(err.errors)

        res.status(400).json({ error: err })
    }
}

export default validate