const express = require("express");
const router = express.Router();
const passport = require("passport");
const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/", messageController.index);

router.get("/new-message", ensureAuthenticated, messageController.new_message_get);
router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

router.get("/logout", authController.logout_get);

router.get("/join-club", ensureAuthenticated, authController.join_club_get);
router.post("/join-club", ensureAuthenticated, authController.join_club_post);

router.get("/become-admin", ensureAuthenticated, authController.join_club_get);
router.post("/become-admin", ensureAuthenticated, authController.join_club_post);

module.exports = router;