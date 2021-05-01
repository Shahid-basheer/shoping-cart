const { response } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers');
const { doSignup } = require('../helpers/users-helpers');
var session = require('express-session')
var usersHelpers=require('../helpers/users-helpers');
var otp = require('../helpers/otp')
var twilo = require('twilio')(otp.accountSID,otp.authToken)





/* GET home page. */


function verifyLogin(req,res,next){
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}





router.get('/', async function(req, res) {
let users=req.session.users
let count=null

if(users){
   count = await usersHelpers.getCartCount(req.session.users._id)
   
      }
    productHelpers.getAllproducts().then((products)=>{
      res.render('user/view-products',{count,users,products,user:true});
      
    })
    

})



router.get('/login',function(req, res){
  
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
      res.render('user/login');
    }
  
  
});




router.get('/signup', function(req, res, next) {
  
  if(req.session.signIn){
    res.redirect('/login')
  }else{
    res.render('user/signup',{sign:true});
  } 
  
});

router.post('/signup', async function(req, res, next) {
  console.log(req.body);
  req.session.phone=req.body.phone
  req.session.channel=req.body.channel
  req.session.signIn=true
    usersHelpers.doSignup(req.body).then((response)=>{
    if(response){
      res.render('user/signup',{response})
    }else{
      
      res.redirect('/login')
    }
    })

});



router.post('/login', function(req, res, next) {
  
  usersHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.users=response.user

      twilo.verify.services(otp.serviceId).verifications.create({
        to:`+91${req.session.users.phone}`,
        channel:req.session.users.channel
      }).then((data)=>{
        console.log(data);
      })
      res.json({status:true})
      
      console.log(req.session.users.phone);
     
    }else{
      res.json({status:false})
      res.redirect('/login')
    }
  })
    
  
 
});

let status=null
router.get('/verify',(req,res)=>{
  
   res.render('user/otp',{status})
})

router.post('/verify-otp',(req,res)=>{
  console.log('***********888');
  twilo.verify.services(otp.serviceId).verificationChecks.create({
      to:`+91${req.session.users.phone}`,
      code:req.body.code
       })
       .then((data)=>{
         if(data.status!='pending'){
           res.redirect('/')
         }else{
           status=true
           res.redirect('/verify')
         }
       })
  
})






router.get('/resend-otp',(req,res)=>{
    twilo.verify.services(otp.serviceId).verifications.create({
        to:`+${req.session.users.phone}`,
        channel:req.session.users.channel
    })
    .then((data)=>{
      console.log(data)
    })

   res.redirect('/verify')
  
})





router.get('/addtocart/:id',((req,res)=>{
  console.log('ajax called');
      usersHelpers.addtoCart(req.params.id,req.session.users._id).then((response)=>{
        
      })
      res.json({status:true})
}))


let totalValue
router.get('/cartItem',verifyLogin,async(req,res)=>{
    const users = req.session.users

let products =await usersHelpers.getCartProducts(req.session.users._id)

if(products.length==0){
  res.render('user/cart',{products,user:true,users})
}else{
 totalValue = await usersHelpers.totalAmmount(req.session.users._id)
  res.render('user/cart',{products,totalValue,user:true,users})
}
})

  



router.post('/change-productQuantity',(req,res)=>{
  usersHelpers.changeQuantity(req.body).then(async(respones)=>{
    respones.total = await usersHelpers.totalAmmount(req.body.user)
    
    res.json(respones)
  })
})



router.post('/remove-product',(req,res)=>{
   usersHelpers.removeProduct(req.body).then((response)=>{
      res.json(response)
   })
  console.log('ajax called')
})


router.get('/placeholder',verifyLogin,async(req,res)=>{
  let users=req.session.users
  res.render('user/delivery',{totalValue,user:true,users})
})


router.post('/order-products',async(req,res)=>{
  
 let products = await usersHelpers.getCartProductList(req.body.userId)
 if(products){
  let total = await  usersHelpers.totalAmmount(req.body.userId)
  usersHelpers.placeHolder(req.body,products,total).then((orderId)=>{
    if(req.body.paymentMethod==='cod'){
      res.json({codSuccess:true})
    }else{
      usersHelpers.generateRazorpay(orderId,total).then((response)=>{
        console.log(response);
        res.json(response)
      })
    }
    
  })
  
 }else{
   res.redirect('/')
  console.log('else worked');
 }
  
})



router.get('/orederd',(req,res)=>{


 res.render('user/order-success',{user:true})
    

  

})


router.post('/verify-payment',(req,res)=>{
  console.log(req.body)
  usersHelpers.verifyPayment(req.body).then((response)=>{
usersHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
  console.log(req.body)
  res.json({status:true})
  console.log('payment successful');
}).catch(()=>{
  res.json({status:'payment failed'})
})
  })
  res.json({status:true})
})




router.get('/view-orderd-products',verifyLogin,(req,res)=>{
 
  console.log(products);console.log(products);console.log(products);usersHelpers.viewOrderdProducts(req.session.users._id).then((products)=>{
    res.render('user/view-order-products',{products,user:true})
  })
})




router.get('/view-oders/:id',verifyLogin, async(req,res)=>{
  let products= await usersHelpers.getOrderProducts(req.params.id)
  res.render('user/view-oders',{products,user:true})
})





router.post('/cancel-order',verifyLogin,async(req,res)=>{
    usersHelpers.cancelOrders(req.body.orderId,req.body.proId,req.session.users._id).then(()=>{
      usersHelpers.totalPrice(req.body.orderId)
    })
    
    res.json({status:true})
  
  res.redirect('/view-orderd-products')
})



router.get('/myaccount',(req,res)=>{
  let users = req.session.users
  console.log(users._id);
  res.render('user/myAccount',{users,user:true})
})








router.get('/logout',((req,res)=>{
  req.session.destroy()
  res.redirect('/')
}))








module.exports = router;
