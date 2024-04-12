// const { User } = require('../model/User');
// const crypto = require("crypto");
// const { sanitizeUser } = require('../services/common');
// const SECRET_KEY = 'SECRET_KEY';
// const jwt = require('jsonwebtoken');

// exports.createUser = async (req, res) => {
//     try {
//         const salt = crypto.randomBytes(16);
//         crypto.pbkdf2(
//             req.body.password,
//             salt,
//             310000,
//             32,
//             "sha256",
//             async function (err, hashedPassword) {
//                 const user = new User({ ...req.body, password: hashedPassword, salt });
//                 const doc = await user.save();

//                 // by-default session doesn't get created. after any activity if you want to create session you need to manually create. here after signup we want login session so using login(the data you want to save to the session, a callback which tells where to redirect)
//                 req.login(sanitizeUser(doc), (err) => {
//                     if (err) {
//                         res.status(400).json(err);
//                     } else {
//                         const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
//                         // to send token to frontend, we need to use cookie 
//                         res.cookie("jwt", token, {
//                                 expires: new Date(Date.now() + 3600000),
//                                 httpOnly: true
//                             })
//                             .status(201)
//                             .json({ id: doc.id, role: doc.role });
//                     }
//                 })
//             }
//         )
//     } catch (err) {
//         res.status(400).json(err);
//     }
// };

// exports.loginUser = async (req, res) => {
//     // try {
//     //     const user = await User.findOne(
//     //         { email: req.body.email },
//     //     ).exec();
//     //     // TODO: this is just temporary, we will use strong password auth
//     //     console.log({ user })
//     //     if (!user) {
//     //         res.status(401).json({ message: 'no such user email' });
//     //     } else if (user.password === req.body.password) {
//     //         // TODO: We will make addresses independent of login
//     //         res.status(200).json({ id: user.id, role: user.role });
//     //     } else {
//     //         res.status(401).json({ message: 'invalid credentials' });
//     //     }
//     // } catch (err) {
//     //     res.status(400).json(err);
//     // }

//     // all the things we have done with passport. 
//     // just sending the response


//     // this req.user is coming from passport mw. it is created when the user is authenticated

//     res
//         .cookie("jwt", req.user.token, {
//             expires: new Date(Date.now() + 3600000),
//             httpOnly: true
//         })
//         .status(201)
//         .json(req.user.token);
// };


// // creating this api to get the serialized response from passport. so for every authentication related task wil call this method
// exports.checkAuth = async (req, res) => {
//     if(req.user){
//         res.json(req.user)
//     } else {
//         res.status(401).json({message: "UnAuthorized"})
//     }
// };


// // SO THE THING IS: you signup -> create a session -> login -> check user -> if check user true then proceed to routes. 



// // const { User } = require('../model/User');
// // const crypto = require('crypto');
// // const { sanitizeUser } = require('../services/common');
// // const SECRET_KEY = 'SECRET_KEY';
// // const jwt = require('jsonwebtoken');

// // exports.createUser = async (req, res) => {
// //     try {
// //         const salt = crypto.randomBytes(16);
// //         crypto.pbkdf2(
// //             req.body.password,
// //             salt,
// //             310000,
// //             32,
// //             'sha256',
// //             async function (err, hashedPassword) {
// //                 const user = new User({ ...req.body, password: hashedPassword, salt });
// //                 const doc = await user.save();

// //                 req.login(sanitizeUser(doc), (err) => {
// //                     // this also calls serializer and adds to session
// //                     if (err) {
// //                         res.status(400).json(err);
// //                     } else {
// //                         const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
// //                         res
// //                             .cookie('jwt', token, {
// //                                 expires: new Date(Date.now() + 3600000),
// //                                 httpOnly: true,
// //                             })
// //                             .status(201)
// //                             .json({ id: doc.id, role: doc.role });
// //                     }
// //                 });
// //             }
// //         );
// //     } catch (err) {
// //         res.status(400).json(err);
// //     }
// // };

// // exports.loginUser = async (req, res) => {
// //     res
// //         .cookie('jwt', req.user.token, {
// //             expires: new Date(Date.now() + 3600000),
// //             httpOnly: true,
// //         })
// //         .status(201)
// //         .json(req.user.token);
// // };

// // exports.checkAuth = async (req, res) => {
// //     if (req.user) {
// //         res.json(req.user);
// //     } else {
// //         res.sendStatus(401);
// //     }
// // };





const { User } = require('../model/User');
const crypto = require('crypto');
const { sanitizeUser } = require('../services/common');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    try {
        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(
            req.body.password,
            salt,
            310000,
            32,
            'sha256',
            async function (err, hashedPassword) {
                const user = new User({ ...req.body, password: hashedPassword, salt });
                const doc = await user.save();

                req.login(sanitizeUser(doc), (err) => {
                    // this also calls serializer and adds to session
                    if (err) {
                        res.status(400).json(err);
                    } else {
                        const token = jwt.sign(sanitizeUser(doc), process.env.JWT_SECRET_KEY);
                        res
                            .cookie('jwt', token, {
                                expires: new Date(Date.now() + 3600000),
                                httpOnly: true,
                            })
                            .status(201)
                            .json({ id: doc.id, role: doc.role });
                    }
                });
            }
        );
    } catch (err) {
        res.status(400).json(err);
    }
};

exports.loginUser = async (req, res) => {
    const user = req.user;

    res
        .cookie('jwt', user.token, {
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        })
        .status(201)
        .json({id: user.id, role: user.role});
};

exports.checkAuth = async (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.sendStatus(401);
    }
};
