import rateLimit from "express-rate-limit";

const setupRateLimit = (minute: number, maxRequest: number, message: string) => {
    return rateLimit({
        windowMs: 1000 * 60 * minute,
        max: maxRequest,
        standardHeaders: true,
        legacyHeaders: true,
        message: {
            message
        }
    })
}

export default setupRateLimit;