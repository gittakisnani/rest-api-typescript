import { FilterQuery, FlattenMaps, QueryOptions, UpdateQuery } from "mongoose";
import Product, { ProductDocument, ProductInput } from "../models/product.model";


async function createProduct(input: ProductInput) : Promise<FlattenMaps<ProductDocument>> {
    const product = await Product.create(input);

    return product.toJSON()
}

async function findAndUpdateProduct(query: FilterQuery<ProductDocument>, update: UpdateQuery<ProductDocument>, options?: QueryOptions) {
    return Product.findOneAndUpdate(query, update, options).exec()
}

async function findProduct(query: FilterQuery<ProductDocument>, options: QueryOptions = { lean: true }) {
    return Product.findOne(query, {}, options).exec()
}

async function deleteProduct(query: FilterQuery<ProductDocument>) {
    return Product.findOneAndDelete(query);
}



export {
    createProduct,
    findProduct,
    findAndUpdateProduct,
    deleteProduct
}