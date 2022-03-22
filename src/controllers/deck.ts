import { Request, Response } from "express";
import { DeckInput, DeckInformation, DeckResponse, Top10DeckData } from "../types/deck";
import { UserInformation } from "../types/user";
import { Card } from "../types/card";
import connection from "../mysql_connection";
import { v4 as uuidv4 } from "uuid";
import {
    getDeckCache,
    setDeckCache,
    removeDeckCache,
    isExistingDeckCache,
    isExistingCache,
    removeDeckCacheByUserId,
} from "../services/redis-actions";

export const createDeckHandler = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body as DeckInput;
        const { _id } = req.body.user as UserInformation;
        await connection.query(
            `INSERT INTO decks (_id, title, description, created_by) values (?, ?, ?, ?)`,
            [uuidv4(), title, description ? description : "", _id]
        );
        res.status(201).send({
            message: "Created",
        });
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const getDeck = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const _id: string = req.body.user ? req.body.user._id : "";
        console.log(_id);
        const query = `
            SELECT decks._id as deck_id, decks.title, decks.description, decks.is_public, decks.created_at, users._id as created_by, users.username as username, COUNT(likes.user_id) as likes_length
                ${_id === "" ? "" : ", COUNT(bookmarks.user_id) as in_bookmark"}
            FROM decks
                LEFT JOIN users
                ON decks.created_by = users._id
                ${
                    _id === ""
                        ? ""
                        : `LEFT JOIN bookmarks ON decks._id = bookmarks.deck_id AND bookmarks.user_id = "${_id}"`
                }
                LEFT JOIN likes
                ON decks._id = likes.deck_id
                GROUP BY decks._id
                HAVING decks._id = ?
        `;
        const deck = (await connection.query(query, [id])) as unknown as DeckInformation[];
        if (deck.length === 0 || !deck[0].deck_id) {
            res.status(404).send({
                message: "Deck not found",
            });
        } else {
            if (deck[0].is_public) {
                // If public deck
                if (_id) {
                    // If public deck and authorized
                    const deckCache = await getDeckCache(id, _id);
                    if (deckCache) {
                        res.status(200).send(deckCache);
                    } else {
                        const cards = (await connection.query(
                            `SELECT _id, front, back FROM cards WHERE deck_id = ? ORDER BY order_`,
                            [id]
                        )) as unknown as Card[];
                        const deckData: DeckResponse = {
                            deck: {
                                deck_id: deck[0].deck_id,
                                title: deck[0].title,
                                description: deck[0].description!,
                                is_public: deck[0].is_public!,
                                created_at: deck[0].created_at!,
                                created_by: {
                                    _id,
                                    username: deck[0].username!,
                                },
                                likes: deck[0].likes_length,
                                cards_length: cards.length,
                                in_bookmark: deck[0].in_bookmark!,
                            },
                            cards: cards,
                        };
                        res.status(200).send(deckData);
                        setDeckCache(id, _id, deckData);
                    }
                } else {
                    // If public deck and not authorized
                    const cards = (await connection.query(
                        `SELECT _id, front, back FROM cards WHERE deck_id = ? ORDER BY order_`,
                        [id]
                    )) as unknown as Card[];
                    const deckData: DeckResponse = {
                        deck: {
                            deck_id: deck[0].deck_id,
                            title: deck[0].title,
                            description: deck[0].description!,
                            is_public: deck[0].is_public!,
                            created_at: deck[0].created_at!,
                            created_by: {
                                _id,
                                username: deck[0].username!,
                            },
                            likes: deck[0].likes_length,
                            cards_length: cards.length,
                        },
                        cards: cards,
                    };
                    res.status(200).send(deckData);
                }
            } else {
                // If private deck
                if (deck[0].created_by === _id) {
                    // If is owner
                    const deckCache = await getDeckCache(id, _id);
                    if (deckCache) {
                        res.status(200).send(deckCache);
                    } else {
                        const cards = (await connection.query(
                            `SELECT _id, front, back FROM cards WHERE deck_id = ? ORDER BY order_`,
                            [id]
                        )) as unknown as Card[];
                        const deckData: DeckResponse = {
                            deck: {
                                deck_id: deck[0].deck_id,
                                title: deck[0].title,
                                description: deck[0].description!,
                                is_public: deck[0].is_public!,
                                created_at: deck[0].created_at!,
                                created_by: {
                                    _id,
                                    username: deck[0].username!,
                                },
                                likes: deck[0].likes_length,
                                cards_length: cards.length,
                                in_bookmark: deck[0].in_bookmark!,
                            },
                            cards: cards,
                        };
                        res.status(200).send(deckData);
                        setDeckCache(id, _id, deckData);
                    }
                } else {
                    res.status(403).send({
                        message: "Deck is private",
                    });
                }
            }
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const getTop5DeckHandler = async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT decks._id, decks.title, COUNT(likes.user_id) as likes_length FROM decks
                LEFT JOIN likes
                ON decks._id = likes.deck_id
                WHERE decks.is_public = true
                GROUP BY decks._id
                ORDER BY likes_length DESC
                LIMIT 5
        `;
        const decks = (await connection.query(query)) as unknown as Top10DeckData[];
        res.status(200).send({
            decks,
        });
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const editDeckInformationHandler = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body.user as { _id: string };
        const { id, title, description, is_public } = req.body as DeckInput;
        const deck = (await connection.query(
            `SELECT created_by FROM decks WHERE _id = "${id}"`
        )) as unknown as DeckInformation[];
        console.log(deck);
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
                await connection.query(
                    `UPDATE decks SET title = ?, description = ?, is_public = ? WHERE _id = "${id}"`,
                    [title, description, is_public]
                );
                res.status(201).send({
                    message: "Updated",
                });

                const isExisting = await isExistingDeckCache(id);
                if (isExisting) {
                    removeDeckCache(id);
                }
                if (!is_public) {
                    await connection.query(
                        "DELETE FROM bookmarks WHERE deck_id = ? AND user_id != ?",
                        [id, _id]
                    );
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const deleteDeckHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { _id } = req.body.user as { _id: string };

        const deck = (await connection.query(`SELECT created_by FROM decks WHERE _id = ?`, [
            id,
        ])) as unknown as { created_by: string }[];
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
                await connection.query(`DELETE FROM decks WHERE _id = ?`, [id]);
                res.status(201).send({
                    message: "Deleted",
                    deck_id: id,
                });
                const isExisting = await isExistingDeckCache(id);
                if (isExisting) {
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

export const searchDeckHandler = async (req: Request, res: Response) => {
    try {
        const { key } = req.params as { key: string };
        if (key.trim() === "") {
            res.status(200).send({
                decks: [],
            });
        } else {
            const query = `
                SELECT decks._id, decks.title, users.username FROM decks
                    INNER JOIN users
                    ON decks.created_by = users._id
                    WHERE decks.title LIKE ?
            `;
            const decks = (await connection.query(query, [`${key}%`])) as unknown as {
                _id: string;
                title: string;
                username: string;
            }[];
            res.status(200).send({
                decks,
            });
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const likeDeckHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.body as { id: string };
        const { _id } = req.body.user as { _id: string };

        const query = `
            SELECT decks.is_public, decks.created_by, COUNT(likes.user_id) as likes_ FROM decks
                LEFT JOIN likes
                ON decks._id = likes.deck_id
                GROUP BY decks._id 
                HAVING decks._id = ?
        `;
        const like = (await connection.query(query, [id])) as unknown as {
            is_public: boolean;
            created_by: string;
            likes_: number;
        }[];
        if (like.length === 0) {
            res.status(400).send({
                message: "Deck not found",
            });
        } else {
            if (like[0].likes_ > 0) {
                res.status(400).send({
                    message: "You already liked this deck",
                });
            } else {
                if (like[0].is_public) {
                    await connection.query(`INSERT INTO likes (user_id, deck_id) VALUES (?, ?)`, [
                        _id,
                        id,
                    ]);
                    res.status(201).send({
                        message: "Liked",
                    });

                    const isExisting = await isExistingDeckCache(id);
                    if (isExisting) {
                        removeDeckCache(id);
                    }
                } else {
                    if (like[0].created_by === _id) {
                        await connection.query(
                            `INSERT INTO likes (user_id, deck_id) VALUES (?, ?)`,
                            [_id, id]
                        );
                        res.status(201).send({
                            message: "Liked",
                        });

                        const isExisting = await isExistingDeckCache(id);
                        if (isExisting) {
                            removeDeckCache(id);
                        }
                    } else {
                        res.status(403).send({
                            message: "Access denied",
                        });
                    }
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const unlikeDeckHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.body as { id: string };
        const { _id } = req.body.user as { _id: string };

        const query = `
            SELECT decks.is_public, decks.created_by, COUNT(likes.user_id) as likes_ FROM decks
                LEFT JOIN likes
                ON decks._id = likes.deck_id
                GROUP BY decks._id 
                HAVING decks._id = ?
        `;
        const like = (await connection.query(query, [id])) as unknown as {
            is_public: boolean;
            created_by: string;
            likes_: number;
        }[];

        if (like.length === 0) {
            res.status(400).send({
                message: "Deck not found",
            });
        } else {
            if (like[0].likes_ === 0) {
                res.status(400).send({
                    message: "You never like this deck",
                });
            } else {
                if (like[0].is_public) {
                    await connection.query(`DELETE FROM likes WHERE user_id = ? AND deck_id = ?`, [
                        _id,
                        id,
                    ]);
                    res.status(201).send({
                        message: "UnLiked",
                    });

                    const isExisting = await isExistingDeckCache(id);
                    if (isExisting) {
                        removeDeckCache(id);
                    }
                } else {
                    if (like[0].created_by === _id) {
                        await connection.query(
                            `DELETE FROM likes WHERE user_id = ? AND deck_id = ?`,
                            [_id, id]
                        );
                        res.status(201).send({
                            message: "UnLiked",
                        });

                        const isExisting = await isExistingDeckCache(id);
                        if (isExisting) {
                            removeDeckCache(id);
                        }
                    } else {
                        res.status(403).send({
                            message: "Access denied",
                        });
                    }
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const addToBookmarkHandler = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body.user as { _id: string };
        const { id } = req.body as { id: string };

        const deck = (await connection.query(
            `SELECT _id, is_public, created_by FROM decks WHERE _id = ?`,
            [id]
        )) as unknown as { _id: string; is_public: boolean; created_by: string }[];
        if (deck.length === 0) {
            res.status(404).send({
                message: "Deck not found",
            });
        } else {
            if (deck[0].is_public) {
                const isInBookmark = (await connection.query(
                    `SELECT user_id FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                    [_id, id]
                )) as unknown as { user_id: string }[];
                if (isInBookmark.length > 0) {
                    res.status(400).send({
                        message: "You already saved this deck",
                    });
                } else {
                    await connection.query(
                        `INSERT INTO bookmarks(user_id, deck_id) VALUES (?, ?)`,
                        [_id, id]
                    );
                    res.status(201).send({
                        message: "Saved",
                    });

                    const isExisting = await isExistingCache(id, _id);
                    if (isExisting) {
                        await removeDeckCacheByUserId(id, _id);
                    }
                }
            } else {
                if (_id === deck[0].created_by) {
                    const isInBookmark = (await connection.query(
                        `SELECT user_id FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                        [_id, id]
                    )) as unknown as { user_id: string }[];
                    if (isInBookmark.length > 0) {
                        res.status(400).send({
                            message: "You already saved this deck",
                        });
                    } else {
                        await connection.query(
                            `INSERT INTO bookmarks(user_id, deck_id) VALUES (?, ?)`,
                            [_id, id]
                        );
                        res.status(201).send({
                            message: "Saved",
                        });

                        const isExisting = await isExistingCache(id, _id);
                        if (isExisting) {
                            await removeDeckCacheByUserId(id, _id);
                        }
                    }
                } else {
                    res.status(403).send({
                        message: "Deck is private",
                    });
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};

export const removeBookmarkHandler = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body.user as { _id: string };
        const { id } = req.body as { id: string };

        const deck = (await connection.query(
            `SELECT _id, is_public, created_by FROM decks WHERE _id = ?`,
            [id]
        )) as unknown as { _id: string; is_public: boolean; created_by: string }[];
        if (deck.length === 0) {
            res.status(404).send({
                message: "Deck not found",
            });
        } else {
            if (deck[0].is_public) {
                const isInBookmark = (await connection.query(
                    `SELECT user_id FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                    [_id, id]
                )) as unknown as { user_id: string }[];
                if (isInBookmark.length === 0) {
                    res.status(400).send({
                        message: "Could not remove from bookmark",
                    });
                } else {
                    await connection.query(
                        `DELETE FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                        [_id, id]
                    );
                    res.status(201).send({
                        message: "Removed",
                    });

                    const isExisting = await isExistingCache(id, _id);
                    if (isExisting) {
                        await removeDeckCacheByUserId(id, _id);
                    }
                }
            } else {
                if (_id === deck[0].created_by) {
                    const isInBookmark = (await connection.query(
                        `SELECT user_id FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                        [_id, id]
                    )) as unknown as { user_id: string }[];
                    if (isInBookmark.length === 0) {
                        res.status(400).send({
                            message: "Could not remove from bookmark",
                        });
                    } else {
                        await connection.query(
                            `DELETE FROM bookmarks WHERE user_id = ? AND deck_id = ?`,
                            [_id, id]
                        );
                        res.status(201).send({
                            message: "Removed",
                        });

                        const isExisting = await isExistingCache(id, _id);
                        if (isExisting) {
                            await removeDeckCacheByUserId(id, _id);
                        }
                    }
                } else {
                    res.status(403).send({
                        message: "Deck is private",
                    });
                }
            }
        }
    } catch (e) {
        res.status(500).send({
            message: "Something went wrong",
        });
    }
};
