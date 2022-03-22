import { Card } from "../types/card";

export type DeckInput = {
    id: string;
    title: string;
    description: string;
    is_public?: boolean;
};

export type DeckInformation = {
    deck_id: string;
    title: string;
    description?: string;
    is_public: boolean;
    created_by: string;
    username?: string;
    created_at?: string;
    /*
    likes: number
    */
    likes_length: number;
    in_bookmark?: number;
};

export type Top10DeckData = {
    _id: string;
    title: string;
    likes_length: number;
}

export type DeckResponse = {
    deck: {
        deck_id: string;
        title: string;
        description: string;
        is_public: boolean;
        created_at: string;
        created_by: {
            _id: string;
            username: string;
        };
        likes: number;
        cards_length?: number;
        in_bookmark?: number;
    };
    cards: Card[];
};
