import { Router } from "express";
const router = Router();
import requireSignIn from "../services/require-sign-in";
import { createDeckValidator, editDeckValidator } from "../validators/deck";
import {
    createDeckHandler,
    getDeck,
    editDeckInformationHandler,
    deleteDeckHandler,
    searchDeckHandler,
    likeDeckHandler,
    unlikeDeckHandler,
    getTop5DeckHandler,
    addToBookmarkHandler,
    removeBookmarkHandler
} from "../controllers/deck";
import setupRateLimit from "../services/rate-limit";
import isLogin from "../services/is-login";

router.post(
    "/deck/create",
    setupRateLimit(10, 50, "Too many create deck, please wait."),
    requireSignIn,
    createDeckValidator,
    createDeckHandler
);

router.get("/deck/top5", getTop5DeckHandler);

router.get("/deck/:id", isLogin, getDeck);

router.put("/deck/edit", requireSignIn, editDeckValidator, editDeckInformationHandler);

router.delete("/deck/:id", requireSignIn, deleteDeckHandler);

router.get("/deck/search/:key", searchDeckHandler);

router.post("/deck/like", requireSignIn, likeDeckHandler);

router.post("/deck/unlike", requireSignIn, unlikeDeckHandler);

router.put("/deck/save-in-bookmark", requireSignIn, addToBookmarkHandler);

router.put("/deck/remove-from-bookmark", requireSignIn, removeBookmarkHandler);

export default router;
