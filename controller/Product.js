const { Product } = require("../model/Product");

// create product 
exports.createProduct = async(req, res) => {
    const product = new Product(req.body); // creating object
    try {
        const doc = await product.save();
        res.status(201).json(doc)
        console.log(doc);
    } catch (error) {
     res.status(400).json(error)   
    }
};

// get products: with filter and sort 
exports.fetchAllProducts = async (req, res) =>{
    let query = Product.find({});   // here just requesting, not executing. thats why no await
    let totalProductsQuery = Product.find({}) // see to get totalDocs (i.e setting to header) we need to create another query. cant get totalDocs on same query. thats why creating this query 

    // filter = {"category":["smartphone","laptops"]}
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}


    // filter 
    if (req.query.category) {
        query = query.find({ category: req.query.category }) // actually filter means find by this
        totalProductsQuery = totalProductsQuery.find({ category: req.query.category })

    }
    if (req.query.brand) {
        query = query.find({ brand: req.query.brand }) // actually filter means find by this
        totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand })
    }

    // sort 
    if(req.query._sort && req.query._order){
        
        query = query.sort({[req.query._sort] : req.query._order})  // .sort({["title": "desc"]})
    }

    const totalDocs = await totalProductsQuery.count().exec()   // here we were unable to use totalDocs = await query.count().exec()  thats why we need to create a new query
    
    //pagination 
    if(req.query._page && req.query._limit){
        const pageSize = req.query._limit;
        const page = req.query._page;
        query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
    try {
        const docs = await query.exec();
        // setting header (needed for pagination)
        res.set("X-Total-Count", totalDocs)
        res.status(200).json(docs);
        
    } catch (error) {
        res.status(400).json(error)
    }
}

exports.fetchProductById = async(req, res) => {
    const {id} = req.params;
    try {
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json(error)
    }
};

exports.updateProduct = async (req, res) => {
    const {id} = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, req.body, {new: true});
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json(error)
    }
};
