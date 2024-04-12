const express = require('express');
const server = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');

const productRouters = require("./routes/Products")
const categoryRouters = require("./routes/Categories")
const brandRouters = require("./routes/Brands");
const userRouters = require("./routes/Users");
const authRouters = require("./routes/Auth");
const cartRouters = require("./routes/Cart");
const orderRouters = require("./routes/Orders");

const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');

// Webhook

// TODO: we will capture actual order after deploying out server live on public URL

const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log({ paymentIntentSucceeded })
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});


// JWT options
const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;

// middlewares
server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser())    // to read cookies coming from frontend
server.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
    })
);

server.use(passport.authenticate('session'));
server.use(cors({
    exposedHeaders: ["X-Total-Count"]
}))

server.use(express.json()); // to parse json data coming from frontend
server.use("/products", isAuth(), productRouters.router);
server.use("/categories", isAuth(), categoryRouters.router);
server.use("/brands", isAuth(), brandRouters.router);
server.use("/users", isAuth(), userRouters.router);
server.use("/auth", authRouters.router);
server.use("/cart", isAuth(), cartRouters.router);
server.use("/orders", isAuth(), orderRouters.router);

// local strategy of passport 
passport.use(
    'local',
    new LocalStrategy(
        {usernameField: "email"},
        async function (email, password, done) {
        // by default passport uses username
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'User not found' }); // in passport dont send res. we use done()
                // done( first arg is error, second arg user ) 
            }
            crypto.pbkdf2(
                password,
                user.salt,
                310000,
                32,
                "sha256",
                async function (err, hashedPassword) {
                    if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                        return done(null, false, { message: 'invalid credentials' });
                    }
                    const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
                    done(null, {id: user.id, role: user.role, token})   // this line sent to serializer
                    // done(null, { token })
                }
            )
        } catch (err) {
            done(err);
        }
    })
);

// jwt strategy of passport 
passport.use(
    'jwt',
    new JwtStrategy(opts, async function (jwt_payload, done) {
        console.log(jwt_payload);
        try {
            const user = await User.findById( jwt_payload.id );
            if (user) {
                return done(null, sanitizeUser(user)); // calls serializer
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

// when you login or signup this creates session variable 
passport.serializeUser(function (user, cb) {
    // console.log('serialize', user);
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });  // if it is authenticated user, storing that user into session variable
    });
});

// this create req.user from session variable when you performed any task that requires authorization. it populate req.user

passport.deserializeUser(function (user, cb) {
    // console.log('de-serialize', user);
    process.nextTick(function () {
        return cb(null, user);
    });
});

// Payments


// test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

server.post("/create-payment-intent", async (req, res) => {
    const { totalAmount } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // for decimal compensation
        currency: "inr",
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});




main().catch(error => console.log(error));

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('database connection established');
}


server.listen(process.env.PORT, () => {
    console.log(`server started at port ${process.env.PORT}`);
})