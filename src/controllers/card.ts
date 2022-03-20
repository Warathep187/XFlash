import { Request, Response } from "express";
import { CardInput, Card } from "../types/card";
import connection from "../mysql_connection";
import { DeckInformation } from "../types/deck";
import { v4 as uuidv4 } from "uuid";
import {removeDeckCache, isExistingDeckCache} from "../services/redis-actions";

const convertToArray = (cards: Card[], deck_id: string): (number | string)[][] => {
    const newCardFormat = [];
    for (const card of cards) {
        newCardFormat.push([uuidv4(), card.order_, card.front, card.back, deck_id]);
    }
    return newCardFormat;
};

export const updateCardHandler = async (req: Request, res: Response) => {
    try {
        const { id, cards } = req.body as CardInput;
        const { _id } = req.body.user;
        const deck = (await connection.query(
            `SELECT _id, created_by FROM decks WHERE _id = "${id}"`
        )) as unknown as DeckInformation[];
        if (deck.length === 0) {
            res.status(404).send({
                message: "Deck not found",
            });
        } else {
            if (_id !== deck[0].created_by) {
                res.status(403).send({
                    message: "Access denied",
                });
            } else {
                await connection.query(`DELETE FROM cards WHERE deck_id = ?`, [id]);
                const newCardFormat = convertToArray(cards, id);
                await connection.query(
                    `INSERT INTO cards (_id, order_, front, back, deck_id) VALUES ?`,
                    [newCardFormat]
                );
                res.status(201).send({
                    message: "Updated"
                });
                const isExisting = await isExistingDeckCache(id);
                if(isExisting) {
                    removeDeckCache(id);
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const removeCardHandler = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body.user as {_id: string};
        const { id } = req.params as {id: string;};
        const query = `
            SELECT cards._id as _id, decks._id as deck_id, decks.created_by as created_by FROM cards
                INNER JOIN decks
                ON cards.deck_id = decks._id
                WHERE cards._id = ?
        `
        const card = await connection.query(query, [id]) as unknown as {_id: string; deck_id: string; created_by: string;}[];
        
        if(card.length === 0) {
            res.status(404).send({
                message: "Card not found"
            })
        } else {
            if(card[0].created_by !== _id) {
                res.status(403).send({
                    message: "Access denied"
                })
            } else {
                await connection.query(`DELETE FROM cards WHERE _id = ?`, [id]);
                res.status(201).send({
                    message: "Removed",
                    removed_card: id
                })
                const isExisting = await isExistingDeckCache(card[0].deck_id);
                if(isExisting) {
                    removeDeckCache(card[0].deck_id);
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};
