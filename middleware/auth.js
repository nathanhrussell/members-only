exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be logged in to view this page");
  res.redirect("/login");
};

exports.ensureClubMember = (req, res, next) => {
  const status = req.user?.membership_status;
  if (status === "club_member" || status === "admin") {
    return next();
  }
  req.flash("error", "Only club members can post messages");
  res.redirect("/join-club");
};
