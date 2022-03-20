import { Router } from "express";
const router = Router();
import {
    SignupHandler,
    verifyAccountHandler,
    signInHandler,
    emailSendingHandler,
    resetPasswordHandler,
    changePasswordHandler,
    changeUsernameHandler,
    viewProfileHandler,
    viewUserProfileHandler,
} from "../controllers/user";
import {
    signupValidator,
    verifyAccountValidator,
    signInValidator,
    resetPasswordValidator,
    changePasswordValidator,
} from "../validators/user";
import setupRateLimit from "../services/rate-limit";
import requireSignIn from "../services/require-sign-in";

router.post(
    "/signup",
    setupRateLimit(10, 10, "Too many signup requests, please try again later"),
    signupValidator,
    SignupHandler
);

router.post("/verify", requireSignIn, verifyAccountValidator, verifyAccountHandler);

router.post(
    "/sign-in",
    setupRateLimit(10, 5, "Too many sign in, please try again later"),
    signInValidator,
    signInHandler
);

router.post(
    "/reset-password-email-sending",
    setupRateLimit(10, 5, "Too many send emails, please try again later"),
    emailSendingHandler
);

router.post(
    "/reset-password",
    setupRateLimit(10, 10, "Too many requests, please try again later"),
    resetPasswordValidator,
    resetPasswordHandler
);

router.post("/change-password", requireSignIn, changePasswordValidator, changePasswordHandler);

router.post("/change-username", requireSignIn, changeUsernameHandler);

router.get("/profile", requireSignIn, viewProfileHandler);

router.get("/profile/:user_id", viewUserProfileHandler)

export default router;
