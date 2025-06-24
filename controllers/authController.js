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
  const error = req.flash("error");
  res.render("login", { error });
};

exports.logout_get = (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.flash("success", "You have logged out");
    res.redirect("/");
  });
};

exports.join_club_get = (req, res) => {
  res.render("join-club", { error: null, success: null });
};

exports.join_club_post = async (req, res, next) => {
  const submittedCode = req.body.code;
  const correctCode = process.env.CLUB_SECRET;

  if (submittedCode !== correctCode) {
    return res.render("join-club", {
      error: "Incorrect code. Try again.",
      success: null,
    });
  }

  try {
    await db.query("UPDATE users SET membership_status = $1 WHERE id = $2", [
      "club_member",
      req.user.id,
    ]);

    // Update session data in memory
    req.user.membership_status = "club_member";

    req.flash("success", "Welcome to the club! You are now a club member.");
    res.redirect("/");

  } catch (err) {
    return next(err);
  }
};

exports.become_admin_get = (req, res) => {
  res.render("become-admin", { error: null, success: null });
};

exports.become_admin_post = async (req, res, next) => {
  const submittedCode = req.body.code;
  const correctCode = process.env.ADMIN_SECRET;

  if (submittedCode !== correctCode) {
    return res.render("become-admin", {
      error: "Incorrect admin code.",
      success: null,
    });
  }

  try {
    await db.query("UPDATE users SET membership_status = $1 WHERE id = $2", [
      "admin",
      req.user.id,
    ]);

    // Update session copy of user object
    req.user.membership_status = "admin";

    req.flash("success", "You are now an admin!");
    res.redirect("/");

  } catch (err) {
    return next(err);
  }
};