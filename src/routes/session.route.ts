import { Router } from "express";
import { createSessionHandler, deleteUserSessionHandler, getUserSessionsHandler, googleOAuthHandler } from "../controllers/session.controller";
import { deserializeUser } from "../middlewares/deserializeUser";
import requireUser from "../middlewares/requireUser";
import validate from "../middlewares/validateResource";
import { createSessionSchema } from "../schemas/session.schema";

const router = Router()
router.use(deserializeUser)


router.route('/api/sessions')
    .get(requireUser, getUserSessionsHandler)
    .post(validate(createSessionSchema), createSessionHandler)
    .delete(requireUser, deleteUserSessionHandler)


router.route("/api/sessions/oauth/google")
    .get(googleOAuthHandler)

export default router;