function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must be logged in to view this page");
    res.redirect("/login");
}

router.get("/new-message", ensureAuthenticated, messageController.new_message_get);