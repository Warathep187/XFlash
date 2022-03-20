import {Router} from "express";
const router = Router();
import requireSignIn from "../services/require-sign-in";
import {createDeckValidator, editDeckValidator} from "../validators/deck";
import {createDeckHandler, getDeck, editDeckInformationHandler, deleteDeckHandler, searchDeckHandler, likeDeckHandler, unlikeDeckHandler} from "../controllers/deck";
import isLogin from "../services/is-login";

router.post("/deck/create", requireSignIn, createDeckValidator, createDeckHandler);

router.get("/deck/:id", isLogin, getDeck);

router.put("/deck/edit", requireSignIn, editDeckValidator, editDeckInformationHandler);

router.delete("/deck/:id", requireSignIn, deleteDeckHandler);

router.get("/deck/search/:key", searchDeckHandler);

router.post("/deck/like", requireSignIn, likeDeckHandler);

router.post("/deck/unlike", requireSignIn, unlikeDeckHandler);

export default router;