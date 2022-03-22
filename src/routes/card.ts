import {Router} from "express";
const router = Router();
import requireSignIn from "../services/require-sign-in";
import {updateCardHandler, removeCardHandler} from "../controllers/card";
import {addCardValidator} from "../validators/card";
import setUpRateLimit from "../services/rate-limit";

router.post("/card/update-cards", setUpRateLimit(5, 10, "Too many update this deck. Please wait"), requireSignIn, addCardValidator, updateCardHandler);

router.delete("/card/remove/:id", requireSignIn, removeCardHandler)

export default router;
