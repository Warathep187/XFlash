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