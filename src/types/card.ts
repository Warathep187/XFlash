export type Card = {
    _id?: string;
    order_: number;
    front: string;
    back: string;
    deck_id?: string;
}

export type CardInput = {
    id: string;
    cards: Card[]
}