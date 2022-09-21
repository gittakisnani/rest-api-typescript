import { Router } from "express";
import { createSessionHandler, deleteUserSessionHandler, getCurrentGithubUser, getUserSessionsHandler, githubOAuthHandler, googleOAuthHandler } from "../controllers/session.controller";
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


router.get("/api/sessions/oauth/google", googleOAuthHandler)
router.get("/api/auth/github", githubOAuthHandler)
router.get("/api/me", getCurrentGithubUser)


export default router;