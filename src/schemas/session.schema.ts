import { object, string } from "zod";

export const createSessionSchema = object({
    body: object({
        password: string({
            required_error: 'Name is required'
        }),
        email: string({
            required_error: 'Email is required'
        }).email('Email is not valid')
    })
})