import { DeckInformation } from "../types/deck";

export type UserSignup = {
    email: string;
    password: string;
    confirm: string;
};

export type VerifyAccount = {
    username: string;
    token: string;
};

export type UserSignIn = {
    email: string;
    password: string;
};

export type ResetPassword = {
    password: string;
    confirm: string;
    token: string;
};

export type ChangePassword = {
    password: string;
    confirm: string;
};

export type UserCheckingType = {
    _id?: string;
    email?: string;
    password?: string;
    username?: string;
    is_verified?: boolean;
    security_key?: string;
};

export type UserInformation = {
    _id: string;
    email?: string;
    username?: string;
};

export type Profile = {
    _id: string;
    email?: string;
    username: string;
    all_likes: number;
    all_decks: number;
};

export type ProfileResponse = {
    user: {
        _id: string;
        email?: string;
        username: string;
        all_likes: number;
        all_decks: number;
    };
    decks: DeckInformation[];
};
