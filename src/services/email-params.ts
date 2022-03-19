type EmailParams = {
    Destination: {
        CcAddresses: [];
        ToAddresses: string[];
    };
    Message: {
        Body: {
            Html: {
                Charset: string;
                Data: string;
            };
        };
        Subject: {
            Charset: string;
            Data: string;
        };
    };
    Source: string;
    ReplyToAddresses: string[];
};

const createEmailParams = (email: string, token: string, subject: string, heading: string, pathname: string): EmailParams => {
    const url = process.env.CLIENT_URL + `/${pathname}/` + token;
    const html = `
        <div>
            <h2>
                ${heading}
            </h2>
            </hr>
            <a href="${url}">${url}</a>
        </div>
    `;
    return {
        Destination: {
            CcAddresses: [],
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: html,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: process.env.SENDER_EMAIL!,
        ReplyToAddresses: [process.env.SENDER_EMAIL!],
    };
};

export default createEmailParams;