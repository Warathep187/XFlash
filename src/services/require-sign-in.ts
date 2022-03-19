import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import connection from "../mysql_connection";

const requireSignIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authenticationHeaders: string = req.headers.authorization!;
        if (!authenticationHeaders) {
            res.status(401).send({
                message: "Unauthorized",
            });
        } else {
            const token = authenticationHeaders.split(" ")[1];
            jwt.verify(token, process.env.JWT_AUTHENTICATION!, async (err, result) => {
                if (err) {
                    res.status(401).send({
                        message: "Unauthorized",
                    });
                } else {
                    const { _id } = result as { _id: string };
                    const user = await connection.query(`SELECT _id FROM users WHERE _id = ?`, [_id]) as unknown as {_id: string;}[];
                    if(user.length === 0) {
                        res.status(401).send({
                            message: "Unauthorized",
                        })
                    }else {
                        req.body._id = _id;
                        next();
                    }
                }
            });
        }
    } catch (e) {
        res.status(500).send("Something went wrong");
    }
};

export default requireSignIn;
