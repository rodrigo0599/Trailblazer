const withAuth = (req, res, next) => {
    // If the user is not logged in, redirect the request to the login route
    if (!req.session.loggedIn) {
      res.redirect('/access/login');
    } else {
      next();
    }
  };
  
  module.exports = withAuth;
  