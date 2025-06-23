const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const initializePassport = require("./passport-config");
const indexRouter = require("./routes/index");

require("dotenv").config();

const app = express();

initializePassport(passport);

app.use("/", indexRouter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "keyboard cat",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

