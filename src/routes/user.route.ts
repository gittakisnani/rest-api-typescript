import {Router} from 'express'
import { createUserHandler, getAllUsersHandler } from '../controllers/user.controller';
import validate from '../middlewares/validateResource';
import { createUserSchema } from '../schemas/user.schema';
const router = Router();

router.route('/api/users')
    .get(getAllUsersHandler)
    .post(validate(createUserSchema), createUserHandler)

export default router