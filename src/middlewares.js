export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.userInfo = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) res.redirect("/login");
  else next();
};
export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn) res.redirect("/");
  else next();
};
