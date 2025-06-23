const express = reqire("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be logged in to view this page");
    res.redirect("/login");
}

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

module.exports = router;