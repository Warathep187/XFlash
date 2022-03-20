import { Request, Response, NextFunction } from "express";
import {CardInput} from "../types/card";

export const addCardValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, cards } = req.body as CardInput;
        if (!/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(id)) {
            res.status(400).send({
                message: "Invalid deck ID",
            });
        } else if(cards.length > 300) {
            res.status(400).send({
                message: "Too many cards. Number of cart must be less than 300"
            })
        } else {
            let isPassed = true;
            for(const card of cards) {
                if(card.front.trim() === "" || card.back.trim() === "") {
                    isPassed = false;
                    break;
                }
            }
            if(isPassed) {
                next();
            } else {
                res.status(400).send({
                    message: "Front text and Back text must be provide"
                })
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};
