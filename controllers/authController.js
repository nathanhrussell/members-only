const db = require("../models/db");
const bcrypt = require("bcryptjs");

exports.signup_post = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (first_name, last_name, email, hashed_password)
       VALUES ($1, $2, $3, $4)`,
      [first_name, last_name, email, hashedPassword]
    );

    res.redirect("/login");
  } catch (err) {
    return next(err);
  }
};
