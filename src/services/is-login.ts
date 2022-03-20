import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import connection from "../mysql_connection";

const isLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authenticationHeaders = req.headers.authorization;
        if (!authenticationHeaders) {
            next();
        } else {
            const token = authenticationHeaders.split(" ")[1];
            jwt.verify(token, process.env.JWT_AUTHENTICATION!, async (err, result) => {
                if (!err) {
                    const { _id } = result as { _id: string };
                    const user = (await connection.query(`SELECT _id FROM users WHERE _id = ?`, [
                        _id,
                    ])) as unknown as { _id: string }[];
                    if (user.length > 0) {
                        req.body.user = {
                            _id
                        };
                    }
                }
                next();
            });
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export default isLogin;
