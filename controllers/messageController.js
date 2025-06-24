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

exports.new_message_get = (req, res) => {
  res.render("new-message");
};

exports.new_message_post = async (req, res, next) => {
  const { title, text } = req.body;

  if (!title || !text || !title.trim() || !text.trim()) {
    return res.render("new-message", {
      error: "Title and message text are required.",
      success: null,
    });
  }

  try {
    await db.query(
      "INSERT INTO messages (title, text, user_id, timestamp) VALUES ($1, $2, $3, NOW())",
      [title.trim(), text.trim(), req.user.id]
    );

    req.flash("success", "Message posted successfully!");
    res.redirect("/");

  } catch (err) {
    next(err);
  }
};
