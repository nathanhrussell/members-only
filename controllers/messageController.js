const db = require("../models/db");

exports.index = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT messages.*, users.first_name || ' ' || users.last_name AS author
      FROM messages
      JOIN users ON messages.user_id = users.id
      ORDER BY messages.timestamp DESC
    `);
    res.render("index", { messages: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.new_message_get = (req, res) => {
  res.render("new-message");
};