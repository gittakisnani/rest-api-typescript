import { object, string, TypeOf } from 'zod'

export const createUserSchema = object({
    body: object({
        name: string({
            required_error: 'Name is required'
        }),
        email: string({
            required_error: 'Email is required'
        }).email('Email is not valid'),
        password: string({
            required_error: 'Password is required'
        }).min(6, 'Password should be 6 characters at least'),
        passwordConfirmation: string({
            required_error: 'Password confirmation is required'
        })
    }).refine(schema => schema.password === schema.passwordConfirmation, {
        message: 'Passwords not match',
        path: ['passwordConfirmation']
    })
})

export type createUserInput = Omit<TypeOf<typeof createUserSchema>['body'], 'passwordConfirmation'>