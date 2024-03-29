const { Cart } = require("../model/Cart");

exports.fetchCartByUser = async (req, res) => {
    // want to find that perticular user who created the cart. 
    const { user } = req.query;
    try {
        const cartItems = await Cart.find({user: user}).populate('user').populate('product');
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(404).json(error)
    }
};

exports.addToCart = async (req, res) => {
    const cart = new Cart(req.body);
    try {
        const doc = await cart.save();
        const result = await doc.populate('product')
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json(error);
    }
};

exports.deleteFromCart = async (req, res) => {
    const {id} = req.params;
    try {
        const doc = await Cart.findByIdAndDelete(id);
        res.status(200).json(doc);
    } catch (error) {
        res.status(400).json(error);
    }
};

exports.updateCart = async (req, res) => {
    const {id} = req.params;
    try {
        const cart = await Cart.findByIdAndUpdate(id, req.body, {new: true});
        const result = await cart.populate('product');
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json(error);
    }
};