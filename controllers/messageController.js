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
