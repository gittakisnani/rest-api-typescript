import { object, string, number, TypeOf, array, ZodObject, ZodTypeAny } from 'zod'

const payload = {
    body: object({
        title: string({
            required_error: 'Title is required',
            invalid_type_error: 'Title must be of type string'
        }),
        description: string({
            required_error: "Description is required",
            invalid_type_error: 'Description must be of type string'
        }).min(50, 'Description should be 50 characters at least'),
        price: number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be of type number'
        }).positive('Price must be positive'),
        images: array(string({
            required_error: 'Image source is required'
        }).url('Must be a url').startsWith('https://', 'Must provide secure url')).min(2, 'Should have two images at least').max(6, 'Should have six images max')
    })
}


const params = {
    params: object({
        productId: string({
            required_error: 'productId is required'
        })
    })
}


const createProductSchema = object({...payload})

const updateProductSchema = object({ ...payload, ...params })

const getProductSchema = object({ ...params })

const deleteProductSchema = object({ ...params })

type CreateProductType = TypeOf<typeof createProductSchema>
type UpdateProductType = TypeOf<typeof updateProductSchema>
type GetProductType = TypeOf<typeof getProductSchema>
type DeleteProductType = TypeOf<typeof deleteProductSchema>

export {
    createProductSchema,
    updateProductSchema,
    getProductSchema,
    deleteProductSchema,
    CreateProductType,
    UpdateProductType,
    DeleteProductType,
    GetProductType
}