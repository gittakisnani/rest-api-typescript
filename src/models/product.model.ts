import mongoose from "mongoose";
import { v4 as uuid } from 'uuid';
import { UserDocument } from "./user.model";

export interface ProductInput {
    user: UserDocument['_id']
    title: string
    description: string
    price: number
    images: string[]
}

export interface ProductDocument extends ProductInput, mongoose.Document {
    createdAt: Date
    updatedAt: Date
}


const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        default: () => `product_${uuid()}`,
        unique: true
    },
    user: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { required: true, type: Number },
    images: [{
        type: String,
        required: true
    }]
    }, {
        timestamps: true
    }
)  

const Product = mongoose.model<ProductDocument>('Product', productSchema)

export default Product;