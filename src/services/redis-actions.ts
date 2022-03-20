import { createClient } from "redis";
import { DeckResponse } from "../types/deck";

const client = createClient({
    url: `redis${process.env.REDIS_URL!}`,
});

export const connectRedis = async () => {
    await client.connect();
    console.log("Redis connected");
};

export const isExistingDeckCache = async (
    deck_id: string,
): Promise<number> | never => {
    try {
        const isExisting = await client.exists(deck_id);
        return isExisting;
    } catch (e) {
        throw new Error("Something went wrong");
    }
};

export const getDeckCache = async (
    deck_id: string,
    user_id: string
): Promise<DeckResponse | undefined> | never => {
    try {
        const deck = await client.hGet(deck_id, user_id);
        if (deck) {
            return JSON.parse(deck);
        } else {
            return undefined;
        }
    } catch (e) {
        throw new Error("Something went wrong");
    }
};

export const setDeckCache = async (deck_id: string, user_id: string, data: DeckResponse) => {
    try {
        await client.hSet(deck_id, user_id, JSON.stringify(data));
        await client.expire(deck_id, 60 * 60);
    } catch (e) {
        throw new Error("Something went wrong");
    }
};

export const removeDeckCache = async (deck_id: string) => {
    try {
        await client.del(deck_id);
    } catch (e) {
        throw new Error("Something went wrong");
    }
};
