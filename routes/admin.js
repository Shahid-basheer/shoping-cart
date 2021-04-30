const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");

var adminEmail = "admin@gmail.com",
  adminPassword = "123";



/* GET users listing. */
router.get("/admin/product", function (req, res, next) {
  productHelpers.getAllproducts().then((products) => {
    console.log(products);

    res.render("admin/view-products", { products, admin: true });
  });
});




router.get("/admin", function (req, res) {
  productHelpers.getAllproducts().then((products) => {
    
  

      
      res.render("admin/view-products", { products, admin: true });
  
  });
});





router.get("/admin-login", function (req, res) {
  if (user) {
    
    res.redirect("/admin");
  } else {
    res.render("admin/login", { loginErr: req.session.logginErr });
req.session.loginErr=false
    
  }
});





router.post("/admin/login", function (req, res, next) {
  productHelpers.getAllproducts().then((products) => {
    
    if (adminEmail === req.body.email && adminPassword === req.body.password) {
      user = req.session.user=true
     
      res.render("admin/view-products", { products, admin: true });
      
    } else {
      req.session.logginErr = true
      res.redirect("/admin-login");
      
    }
  });
});






router.get("/admin/add-products", function (req, res) {
  res.render("admin/add-products", { admin: true });
});

router.post("/admin/add-product", function (req, res) {
  productHelpers.addProduct(req.body.name,req.body.category,req.body.price, (id) => {
    let images = req.files.images;
    images.mv("./public/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});


router.get('/admin/delete-product/:id',(req,res)=>{
  const id = req.params.id
  console.log(id);
  productHelpers.deleteProduct(id).then((response)=>{
    res.redirect('/admin')
  })
})




router.get('/admin/edit-product/:id',(async(req,res)=>{
 const id = req.params.id
 const product = await productHelpers.getOneProduct(id)
    console.log(product._id);
    res.render('admin/editProduct',{product,admin:true})
  
}))

router.post('/admin/edit-product/:id',(req,res)=>{

  productHelpers.editProduct(req.params.id,req.body).then((respone)=>{
    res.redirect('/admin')
  })
  console.log(req.files.images);
  const id = req.params.id
  const images=req.files.images
  if(images){
    images.mv('./public/product-images/'+id+'.png')
  }
})




router.get('/admin/orders',(req,res)=>{
  productHelpers.getOrdersDetails().then((orders)=>{
    res.render('admin/orders',{orders,admin:true})
  })
})



router.get('/admin/all-users',async(req,res)=>{
  let allUsers = await productHelpers.getAllUsers()
res.render('admin/allUsers',{allUsers,admin:true})

})




router.post('/admin/delete-user',(req,res)=>{
  productHelpers.deleteUser(req.body.user)
  res.json({status:true})
})




// router.get('/admin/view/products/:id',async(req,res)=>{
//   let products = await productHelpers.getAllUserProducts(req.params.id)
//   res.render('admin/view-order-products',{products,admin:true})
// })



router.get("/admin/logout", (req, res) => {
 user = req.session.loggedIn = false;
  res.redirect("/admin-login");

});


module.exports = router;
