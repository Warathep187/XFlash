import { Request, Response } from "express";
import connection from "../mysql_connection";
import { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import aws from "aws-sdk";
import {
    UserSignup,
    VerifyAccount,
    UserSignIn,
    ResetPassword,
    ChangePassword,
    UserCheckingType,
    UserInformation,
} from "../types/user";
import createEmailParams from "../services/email-params";

aws.config.update({
    region: "ap-southeast-1",
});

export const SignupHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as UserSignup;

        const users = (await connection.query(
            `SELECT _id, email, is_verified FROM users WHERE email = ?`,
            [email.trim()]
        )) as RowDataPacket as UserCheckingType[];
        if (users.length > 0 && users[0].is_verified) {
            res.status(400).send({
                message: "Email has been used",
            });
        } else {
            const securityKey: string = uuidv4();
            const token: string = jwt.sign({ securityKey }, process.env.JWT_EMAIL_VERIFICATION!, {
                expiresIn: "3m",
            });
            // Send email
            // Config data at C:\Users\ASUS\.aws\credentials
            const params = createEmailParams(
                email,
                token,
                "Complete your registration",
                "Please click this URL to enter your username and verify your account.",
                "verify"
            );
            const emailSending = new aws.SES({
                apiVersion: "2010-12-01",
            })
                .sendEmail(params)
                .promise();

            emailSending
                .then(async () => {
                    const _id = uuidv4();
                    const salt = await bcrypt.genSalt(12);
                    const hashedPassword = await bcrypt.hash(password.trim(), salt);
                    if (users.length > 0 && !users[0].is_verified) {
                        await connection.query(
                            `UPDATE users SET security_key = ? WHERE _id = "${users[0]._id}"`,
                            [securityKey]
                        );
                    } else {
                        await connection.query(
                            `INSERT INTO users (_id, email, password, security_key) values (?, ?, ?, ?)`,
                            [_id, email, hashedPassword, securityKey]
                        );
                    }

                    res.status(200).send({
                        message:
                            "Please check your email to verify your account. Token is valid for 3 minutes",
                    });
                })
                .catch((e) => {
                    console.log(e);
                    res.status(400).send({
                        message: "Could not sent message to your email",
                    });
                });
        }
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
};

export const verifyAccountHandler = async (req: Request, res: Response) => {
    try {
        const { username, token } = req.body as VerifyAccount;
        jwt.verify(token, process.env.JWT_EMAIL_VERIFICATION!, async (err, result) => {
            if (err) {
                res.status(400).send({
                    message: "Token is invalid or expired, please try again",
                });
            } else {
                const { securityKey } = result as { securityKey: string };
                const user = (await connection.query(
                    `SELECT is_verified FROM users WHERE security_key = ?`,
                    [securityKey]
                )) as unknown as UserCheckingType[];
                if (user.length === 0) {
                    res.status(400).send({
                        message: "Token is invalid",
                    });
                } else {
                    const isExistingUsername = (await connection.query(
                        `SELECT username FROM users WHERE username = ?`,
                        [username.trim()]
                    )) as unknown as UserCheckingType[];
                    if (isExistingUsername.length > 0) {
                        res.status(400).send({
                            message: "Username already exists",
                        });
                    } else {
                        await connection.query(
                            `UPDATE users SET username = ?, is_verified = 1, security_key = "" WHERE security_key = ?`,
                            [username, securityKey]
                        );
                        res.status(201).send({
                            message: "Verified",
                        });
                    }
                }
            }
        });
    } catch (e) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
};

export const signInHandler = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as UserSignIn;
        const user = (await connection.query(
            `SELECT _id, email, password FROM users WHERE email = ?`,
            [email, password]
        )) as unknown as UserCheckingType[];
        if (user.length === 0) {
            res.status(400).send({
                message: "Email or password is incorrect",
            });
        } else {
            const isMatch = await bcrypt.compare(password, user[0].password!);
            if (isMatch) {
                const token = jwt.sign({ _id: user[0]._id }, process.env.JWT_AUTHENTICATION!, {
                    expiresIn: "1d",
                });
                res.status(200).send({
                    message: "Logged in successfully",
                    token,
                });
            } else {
                res.status(400).send({
                    message: "Email or password is incorrect",
                });
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const emailSendingHandler = async (req: Request, res: Response) => {
    try {
        const { email } = req.body as { email: string };
        if (
            !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                email.trim()
            )
        ) {
            res.status(400).send("Email is not valid");
        } else {
            const user = (await connection.query(
                `SELECT email, is_verified FROM users WHERE email = ?`,
                [email]
            )) as unknown as UserCheckingType[];
            if (user.length === 0) {
                res.status(400).send({
                    message: "Email not found",
                });
            } else {
                if (!user[0].is_verified) {
                    res.status(400).send({
                        message: "Email is not verified",
                    });
                } else {
                    const securityKey = uuidv4();
                    const token = jwt.sign({ securityKey }, process.env.JWT_RESET_PASSWORD!, {
                        expiresIn: "5m",
                    });

                    await connection.query(`UPDATE users SET security_key = ? WHERE email = ?`, [
                        securityKey,
                        email,
                    ]);

                    const params = createEmailParams(
                        email,
                        token,
                        "Password resetting",
                        "Please click the following URL to reset your password. URL is valid for 5 minute",
                        "reset-password"
                    );
                    const emailSending = new aws.SES({
                        apiVersion: "2010-12-01",
                    })
                        .sendEmail(params)
                        .promise();

                    emailSending
                        .then(() => {
                            res.status(201).send({
                                message:
                                    "Email has been sent. Please check your email to reset your password",
                            });
                        })
                        .catch((e) => {
                            console.log(e);
                            res.status(400).send({
                                message: "Couldn't send email",
                            });
                        });
                }
            }
        }
    } catch (e) {
        res.status(500).send("Something went wrong");
    }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
    try {
        const { password, token } = req.body as ResetPassword;
        jwt.verify(token, process.env.JWT_RESET_PASSWORD!, async (err, result) => {
            if (err) {
                res.status(400).send({
                    message: "Token is invalid or expired",
                });
            } else {
                const { securityKey } = result as { securityKey: string };
                const user = (await connection.query(
                    `SELECT _id FROM users WHERE security_key = ?`,
                    [securityKey]
                )) as unknown as UserCheckingType[];
                if (user.length === 0) {
                    res.status(400).send({
                        message: "Invalid token",
                    });
                } else {
                    const salt = await bcrypt.genSalt(12);
                    const hashedPassword = await bcrypt.hash(password.trim(), salt);
                    await connection.query(
                        `UPDATE users SET password = ?, security_key = "" WHERE security_key = "${securityKey}"`,
                        [hashedPassword]
                    );
                    res.status(201).send({
                        message: "Password reset successfully. Let's login",
                    });
                }
            }
        });
    } catch (e) {
        res.status(500).send("Something went wrong");
    }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
    try {
        const { password } = req.body as ChangePassword;
        const { _id } = req.body as UserInformation;

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password.trim(), salt);

        await connection.query(`UPDATE users SET password = ? WHERE _id = "${_id}"`, [
            hashedPassword,
        ]);
        res.status(201).send({
            message: "Password changed",
        });
    } catch (e) {
        res.status(500).send("Something went wrong");
    }
};

export const changeUsernameHandler = async (req: Request, res: Response) => {
    try {
        const { _id, username } = req.body as UserInformation;
        if (!username || username.trim() === "") {
            res.status(400).send({
                message: "Username must be provide",
            });
        } else if (username.trim().length > 32) {
            res.status(400).send({
                message: "Username must be less than 32 characters",
            });
        } else {
            const isUsed = (await connection.query(`SELECT _id from users WHERE username = ? AND _id != "${_id}"`, [
                username!.trim(),
            ])) as unknown as UserCheckingType[];
            if (isUsed.length > 0) {
                res.status(400).send({
                    message: "Username has already been used",
                });
            } else {
                await connection.query(`UPDATE users SET username = ? WHERE _id = "${_id}"`, [
                    username!.trim(),
                ]);
                res.status(201).send({
                    message: "Updated"
                })
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};