import pino from "pino";
import dayjs from "dayjs";

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
    base: {
        pid: false
    }
})