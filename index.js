const express = require('express');
const mongoose = require('mongoose');
const server = express();
const cors = require('cors');

const productRouters = require("./routes/Products")
const categoryRouters = require("./routes/Categories")
const brandRouters = require("./routes/Brands");
const userRouters = require("./routes/Users");
const authRouters = require("./routes/Auth");
const cartRouters = require("./routes/Cart");
const orderRouters = require("./routes/Orders");

// middlewares
server.use(cors({
    exposedHeaders: ["X-Total-Count"]
}))
server.use(express.json()); // to parse json data coming from frontend
server.use("/products", productRouters.router);
server.use("/categories", categoryRouters.router);
server.use("/brands", brandRouters.router);
server.use("/auth", authRouters.router);
server.use("/users", userRouters.router);
server.use("/cart", cartRouters.router);
server.use("/orders", orderRouters.router);

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/supperBuzzer');
    console.log('database connection established');
}

main().catch(error => console.log(error));


server.get('/', (req, res) => {
    res.json({
        status: "success"
    })
})

const PORT=8080;
server.listen(PORT, ()=>{
    console.log(`server started at port ${PORT}`);
})