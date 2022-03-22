export const usersSchema = `
    users (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        username VARCHAR(32) DEFAULT "" UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        security_key VARCHAR(100) DEFAULT ""
    )
`;

export const decksSchema = `
    decks (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(512) DEFAULT "",
        is_public BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT NOW(),
        FOREIGN KEY(created_by) REFERENCES users(_id)
    )
`

export const cardsSchema = `
    cards (
        _id VARCHAR(100) NOT NULL PRIMARY KEY,
        order_ INT NOT NULL,
        front VARCHAR(255) NOT NULL,
        back VARCHAR(255) NOT NULL,
        deck_id VARCHAR(100) NOT NULL,
        FOREIGN KEY(deck_id) REFERENCES decks(_id) ON DELETE CASCADE
    )
`

export const likesSchema = `
    likes (
        user_id VARCHAR(100) NOT NULL,
        deck_id VARCHAR(100) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(_id) ON DELETE CASCADE,
        FOREIGN KEY(deck_id) REFERENCES decks(_id) ON DELETE CASCADE
    )
`

export const bookmarksSchema = `
    bookmarks (
        user_id VARCHAR(100) NOT NULL,
        deck_id VARCHAR(100) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(_id),
        FOREIGN KEY(deck_id) REFERENCES decks(_id) ON DELETE CASCADE
    )
`