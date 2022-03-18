export const usersSchema = `
    users (
        _id varchar(100) not null primary key,
        email varchar(100) not null,
        username varchar(32),
        password varchar(255) not null,
        is_verified boolean default false,
        security_token varchar(100)
    )
`;
