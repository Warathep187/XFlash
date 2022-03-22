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
            let isEmpty = false;
            let isLong = false;
            for(const card of cards) {
                if(card.front.trim() === "" || card.back.trim() === "") {
                    isPassed = false;
                    isEmpty = true;
                    break;
                } else if(card.front.trim().length > 255 || card.back.trim().length > 255) {
                    isPassed = false;
                    isLong = true;
                    break;
                }
            }
            if(isPassed && !isEmpty && !isLong) {
                next();
            } else if (isEmpty) {
                res.status(400).send({
                    message: "Front text and Back text must be provide"
                })
            } else if(isLong) {
                res.status(400).send({
                    message: "Front text and Back text must be less than 256 characters"
                })
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};
