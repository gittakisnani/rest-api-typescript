import mongoose, { MongooseError } from "mongoose";
import { logger } from "../utils/logger";
import config from 'config'

const DATABASE_URI = config.get<string>('DATABASE_URI')

const connect = async () => {
    try {
        await mongoose.connect(DATABASE_URI);
        logger.info('Connected to DB')
    } catch(error) {
        logger.error((error as MongooseError).message)
    }
}

export default connect