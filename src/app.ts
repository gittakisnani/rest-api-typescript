import express, { Express } from "express";
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import cookieParser from 'cookie-parser'
import { logger } from "./utils/logger";
import cors from 'cors'
import corsOptions from "./config/corsOptions";
import connect from "./config/DBConnect";
const PORT:number = config.get<number>('port') || 1337;
import userRoute from './routes/user.route'
import sessionRoute from './routes/session.route'
import productRoute from './routes/product.route'
const app: Express = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use(productRoute)
app.use(userRoute)
app.use(sessionRoute)

app.listen(PORT, () => {
    logger.info('Listening on port ' + PORT)
    connect()
})