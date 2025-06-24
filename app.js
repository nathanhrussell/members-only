const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const initializePassport = require("./passport-config");
const indexRouter = require("./routes/index");
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

require("dotenv").config();

initializePassport(passport);

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
    
    if (req.path !== '/login') {
        res.locals.error = req.flash("error");
    } else {
        res.locals.error = null;
    }
    
    next();
});
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

