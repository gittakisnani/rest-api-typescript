import { Request, Response } from "express";
import { UserDocument } from "../models/user.model";
import { CreateProductType, DeleteProductType, GetProductType, UpdateProductType } from "../schemas/product.schema";
import { createProduct, deleteProduct, findAndUpdateProduct, findProduct } from "../services/product.service";

async function createProductHandler(req: Request<{}, {}, CreateProductType['body']>, res: Response) {
    const user = (res.locals.user as UserDocument)._id
    const product = await createProduct({...req.body, user })

    if(!product) return res.status(400).json({ message: 'Could not create product.' })

    res.status(201).json(product)
}


async function updateProductHandler(req: Request<UpdateProductType['params'], {}, UpdateProductType['body']>, res: Response) {
    const user = (res.locals.user as UserDocument)._id;
    const { productId }= req.params;

    const product = await findProduct({ productId })
    if(!product) return res.status(404).json({ message: 'Could not find product' })
    //The product can only be updated by teh user who posted it
    if(String(product?.user) !== user) return res.status(401).json({ message: 'You\'re not authorized to update this product '})

    const updatedProduct = await findAndUpdateProduct({ productId }, req.body, { new: true })

    if(!updatedProduct) return res.status(400).json({ message: 'Could not update product'})

    res.status(200).json(updatedProduct)
}

async function getProductHandler(req: Request<GetProductType['params']>, res: Response) {
    const { productId } = req.params
    const product = await findProduct({ productId })

    if(!product) return res.status(404).json({ message: 'Could not find product'})

    res.json(product)
}

async function deleteProductHandler(req: Request<DeleteProductType['params']>, res: Response) {
    const user = (res.locals.user as UserDocument)._id
    const { productId } = req.params;
    const product = await  findProduct({ productId });
    if(!product) return res.status(404).json({ message: 'Could not find product '})

    // Product can only be deleted by the user who created it.
    if(String(product.user) !== user) return res.status(401).json({ message: 'You\'re not authorized to delete this product'})


    const deletedProduct = await deleteProduct({ productId });

    if(!deleteProduct) return res.status(404).json({ message: 'Could not delete product '})

    res.json(deletedProduct)
}


export {
    createProductHandler,
    updateProductHandler,
    getProductHandler,
    deleteProductHandler
}