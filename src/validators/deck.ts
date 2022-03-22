import { DeckInput } from "../types/deck";
import { Request, Response, NextFunction } from "express";

export const createDeckValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body as DeckInput;
        if (!title || title.trim() === "") {
            res.status(400).send({
                message: "Title must be provide",
            });
        } else if (title.trim().length > 255) {
            res.status(400).send({
                message: "Title must be less than 255 characters",
            });
        } else if (description!.length > 512) {
            res.status(400).send({
                message: "Description must be less than 512 characters",
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

export const editDeckValidator = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, description, is_public } = req.body as DeckInput;
        if (!title || title.trim() === "") {
            res.status(400).send({
                message: "Title must be provide",
            });
        } else if (title.trim().length > 255) {
            res.status(400).send({
                message: "Title must be less than 255 characters",
            });
        } else if (description!.length > 512) {
            res.status(400).send({
                message: "Description must be less than 512 characters",
            });
        } else if (typeof is_public !== "boolean") {
            res.status(400).send({
                message: "Public setting must be boolean",
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
