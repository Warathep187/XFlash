export const usersSchema = `
    users (
        _id varchar(100) not null primary key,
        email varchar(100) not null,
        username varchar(32) default "",
        password varchar(255) not null,
        is_verified boolean default false,
        security_key varchar(100) default ""
    )
`;

export const decksSchema = `
    decks (
        _id varchar(100) not null primary key,
        title varchar(255) not null,
        description varchar(512) default "",
        is_public boolean default false,
        created_by varchar(100) not null,
        created_at datetime default now(),
        foreign key(created_by) references users(_id)
    )
`

export const cardsSchema = `
    cards (
        _id varchar(100) not null primary key,
        order_ int not null,
        front varchar(255) not null,
        back varchar(255) not null,
        deck_id varchar(100) not null,
        foreign key(deck_id) references decks(_id) on delete cascade
    )
`

export const likesSchema = `
    likes (
        user_id varchar(100) not null,
        deck_id varchar(100) not null,
        foreign key(user_id) references users(_id) on delete cascade,
        foreign key(deck_id) references decks(_id) on delete cascade
    )
`