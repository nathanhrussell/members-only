const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../models/db");

exports.signup_get = (req, res) => {
  res.render("signup", { errors: null });
};

exports.signup_post = [
  body("first_name").trim().isLength({ min: 1 }).withMessage("First name required").escape(),
  body("last_name").trim().isLength({ min: 1 }).withMessage("Last name required").escape(),
  body("email")
    .isEmail().withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (value) => {
      const result = await db.query("SELECT id FROM users WHERE email = $1", [value]);
      if (result.rows.length > 0) {
        return Promise.reject("Email already in use");
      }
    }),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/\d/).withMessage("Password must contain a number"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("signup", {
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      await db.query(
        `INSERT INTO users (first_name, last_name, email, hashed_password)
         VALUES ($1, $2, $3, $4)`,
        [req.body.first_name, req.body.last_name, req.body.email, hashedPassword]
      );

      req.flash("success", "You are now registered! Please log in.");
      res.redirect("/login");
    } catch (err) {
      return next(err);
    }
  }
];

exports.login_get = (req, res) => {
  res.render("login", { error: req.flash("error")[0] });
};

exports.logout_get = (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash("success", "You have logged out");
    res.redirect("/");
  });
};
