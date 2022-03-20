import {Router} from "express";
const router = Router();
import requireSignIn from "../services/require-sign-in";
import {updateCardHandler, removeCardHandler} from "../controllers/card";
import {addCardValidator} from "../validators/card";

router.post("/card/update-cards", requireSignIn, addCardValidator, updateCardHandler);

router.delete("/card/remove/:id", requireSignIn, removeCardHandler)

export default router;
