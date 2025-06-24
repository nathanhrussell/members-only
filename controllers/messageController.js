const db = require("../models/db");

exports.index = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT messages.*, users.first_name || ' ' || users.last_name AS author
      FROM messages
      JOIN users ON messages.user_id = users.id
      ORDER BY messages.timestamp DESC
    `);

    res.render("index", {
      messages: result.rows,
      userIsMember: req.user?.membership_status === "club_member" || req.user?.membership_status === "admin",
    });
  } catch (err) {
    next(err);
  }
};

// Add these missing functions:
exports.new_message_get = (req, res) => {
  res.render("new-message");
};

exports.new_message_post = async (req, res, next) => {
  try {
    // Add your message creation logic here
    const { title, text } = req.body;
    await db.query(
      'INSERT INTO messages (title, text, user_id, timestamp) VALUES ($1, $2, $3, NOW())',
      [title, text, req.user.id]
    );
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};