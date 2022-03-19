import { Request, Response, NextFunction } from "express";
import {
    UserSignup,
    VerifyAccount,
    UserSignIn,
    ResetPassword,
    ChangePassword,
} from "../types/user";

export const signupValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, confirm } = req.body as UserSignup;
        if (!email || email.trim() === "") {
            res.status(400).send({
                message: "Email must be provided",
            });
        } else if (!password || password.trim() === "") {
            res.status(400).send({
                message: "Password must be provide",
            });
        } else if (password.indexOf(" ") !== -1) {
            res.status(400).send({
                message: "Invalid password",
            });
        } else if (
            !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                email.trim()
            )
        ) {
            res.status(400).send({
                message: "Invalid email address",
            });
        } else if (password.trim().length < 6) {
            res.status(400).send({
                message: "Password must be at least 6 characters",
            });
        } else if (password.trim() !== confirm) {
            res.status(400).send({
                message: "Password does not match",
            });
        } else {
            next();
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const verifyAccountValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, token } = req.body as VerifyAccount;
        if (!username || username.trim() === "") {
            res.status(400).send({ message: "Username must be provide" });
        } else if (username.trim().length > 32) {
            res.status(400).send({
                message: "Username must be less than 32 characters",
            });
        } else if (!token || token.trim() === "") {
            res.status(400).send({
                message: "Invalid token",
            });
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const signInValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as UserSignIn;
        if (!email || email.trim() === "") {
            res.status(400).send({
                message: "Email must be provided",
            });
        } else if (!password || password.trim() === "") {
            res.status(400).send({
                message: "Password must be provide",
            });
        } else if (password.trim().indexOf(" ") !== -1) {
            res.status(400).send({
                message: "Invalid password",
            });
        } else if (
            !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                email.trim()
            )
        ) {
            res.status(400).send({
                message: "Invalid email address",
            });
        } else if (password.trim().length < 6) {
            res.status(400).send({
                message: "Password is invalid",
            });
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const resetPasswordValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, confirm } = req.body as ResetPassword;
        if (!password || password.trim() === "") {
            res.status(400).send({
                message: "Password must be provide",
            });
        } else if (password.trim().indexOf(" ") !== -1) {
            res.status(400).send({
                message: "Invalid password",
            });
        } else if (!confirm) {
            res.status(400).send({
                message: "Password does not match",
            });
        } else if (password.trim() !== confirm.trim()) {
            res.status(400).send({
                message: "Password does not match",
            });
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const changePasswordValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, confirm } = req.body as ChangePassword;
        if (!password || password.trim() === "") {
            res.status(400).send({
                message: "Password must be provide",
            });
        } else if (password.trim().indexOf(" ") !== -1) {
            res.status(400).send({
                message: "Invalid password",
            });
        } else if (!confirm) {
            res.status(400).send({
                message: "Password does not match",
            });
        } else if (password.trim() !== confirm.trim()) {
            res.status(400).send({
                message: "Password does not match",
            });
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};
