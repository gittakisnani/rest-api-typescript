import mongoose from "mongoose";
import config from 'config'
import bcrypt from 'bcrypt'

export interface UserInput {
    name: string
    email: string 
    password: string
    picture?: string
}

export interface UserDocument extends UserInput, mongoose.Document {
    createdAt: Date
    updatedAt: Date
    comparePassword: (candidatePwd: string) => Promise<boolean>
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function (next) {
    const user = this as UserDocument;
    if(!user.isModified("password")) return next();

    const salt = await bcrypt.genSalt(config.get<number>('salt'))

    const hashedPwd = await bcrypt.hashSync(user.password, salt);
    user.password = hashedPwd;

    return next()
})

userSchema.methods.comparePassword = async function (candidatePwd: string): Promise<boolean> {
    const user = this as UserDocument;
    return await bcrypt.compare(candidatePwd, user.password).catch(err => false)
}

const User = mongoose.model<UserDocument>('User', userSchema)

export default User;

