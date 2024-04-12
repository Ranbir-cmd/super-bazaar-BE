// const passport = require("passport")

// exports.isAuth = (req, res, done) => {
//     // if req.user means the authenticated user is there in session then progress next otherwise not 
//     // if (req.user) {
//     //     done()
//     // } else {
//     //     res.send(401)
//     // }

//     // now using jwt. so now if token is valid only then go forward
//     return passport.authenticate('jwt');
// }

// exports.sanitizeUser = (user) => {
//     return { id: user.id, role: user.role }
// }

// exports.cookieExtractor = function (req) {
//     let token = null;
//     if (req && req.cookies) {
//         token = req.cookies['jwt'];
//     }
//     //TODO : this is temporary token for testing without cookie
//     token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjdkNWY0ODhlNWRjOGYxZDU4NDEyYSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwODQwNTc0fQ.JCv9mUHcGnryiLH7eKBTjOnSt33FytFNETBs7AKupl0"
//     return token;
// };

const passport = require('passport');

exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
};

exports.sanitizeUser = (user) => {
    return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    //TODO : this is temporary token for testing without cookie
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTk1MzNjZWQ3OGViNjM3MTA0NzQ0ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEyOTM1NzQwfQ.gzWaxOeU7i8SuB63EBY9y40xZh5vJlcys-YVPNvBc54"
    return token;
};
