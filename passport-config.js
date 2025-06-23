const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require ("./models/db");
const e = require("connect-flash");
const { use } = require("passport");

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            const user = result.rows[0];

            if (!user) {
                return done(null, false, { message: "No user with that email" });
            }

            const match = await bcrypt.compare(password, user.hashed_password);
            if (match) {
                return done(null, user);
            } else {
                return done(null, false, {message: "Password incorrect" });
            }
        } catch (err) {
            return done(err);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email"}, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err);
        }
    });
}

module.exports = initialize;