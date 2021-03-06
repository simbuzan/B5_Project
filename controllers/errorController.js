const httpStatus = require("http-status-codes");
const path = require('path');

//catch requests made with no matching routes
exports.respondNotFound = (req, res) => {
    let errorCode = httpStatus.StatusCodes.NOT_FOUND;
    res.status(errorCode);
    res.sendFile(`./public/not-found.html`, {root: "./"});
};

//catch requests where internal errors occurred
exports.respondInternalError = (req, res) => {
    let errorCode = httpStatus.StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(errorCode);
    res.sendFile(`./public/internal-error.html`, {root: "./"});
};

// access denied function here
exports.respondAccessDenied = (req, res) => {
    let errorCode = httpStatus.StatusCodes.FORBIDDEN;
    res.status(errorCode);
    res.render("error/access-denied");
}

// redirect to login when user is not logged in.
// @param redirect: String of the relative path you want to redirect the after login.
exports.respondNotLoggedin = (req, res, redirect) => {
    let errorCode = httpStatus.StatusCodes.UNAUTHORIZED;
    res.status(errorCode);
    req.flash("error", "You must be logged in to access the requested page.");
    let path = "/user/login";
    if (typeof redirect !== "undefined") path += "?redirect=" + encodeURI(redirect);
    res.redirect(path);
}