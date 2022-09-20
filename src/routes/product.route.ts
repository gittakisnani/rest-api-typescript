import { Router } from "express";
import { ZodSchema } from "zod";
import { createProductHandler, deleteProductHandler, getProductHandler, updateProductHandler } from "../controllers/product.contoller";
import { deserializeUser } from "../middlewares/deserializeUser";
import requireUser from "../middlewares/requireUser";
import validate from "../middlewares/validateResource";
import { createProductSchema, deleteProductSchema, getProductSchema, updateProductSchema } from "../schemas/product.schema";
const router = Router();

router.use(deserializeUser);

router.route('/api/products')
    .post(requireUser, validate(createProductSchema), createProductHandler)

router.route('/api/products/:productId')
    .get(validate(getProductSchema), getProductHandler)
    .patch(requireUser, validate(updateProductSchema), updateProductHandler)
    .delete(requireUser, validate(deleteProductSchema), deleteProductHandler)
    

export default router