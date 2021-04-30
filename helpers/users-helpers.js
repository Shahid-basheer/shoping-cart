var db = require("../config/connection");
var collection = require("../config/collections");
const collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;
var Razorpay = require('razorpay');
const { resolve } = require("path");
var instance = new Razorpay({
  key_id: 'rzp_test_a0FhXjLxQbDrm5',
  key_secret: '8mqUi6vD5IJ1obKeKwUjN1CK',
});


module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      let email = await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})
    
    if(email){
      
      resolve(response=true)
    }else{
      
    let  response=false
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection(collections.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(response,data.ops[0]);
        });
    }
      
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collections.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            console.log("login success");
            resolve(response);
          } else {
            console.log("login fail");
            response.status = false;
            resolve(response);
          }
        });
      } else {
        console.log("login fail");
        response.status = false;
        resolve(response);
      }
    });
  },

  addtoCart: (proId, userId) => {
    const proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExit = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExit);
        if (proExit != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { "products.item": objectId(proId) },

              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {});
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then((response) => {
              console.log("if worked");
            });
        }
      } else {
        console.log("else worked");
        const cartObj = {
          user: objectId(userId),
          products: [proObj],
        };

        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            console.log(response);
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      const cartItems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          // {
          //   $lookup:{
          //     from:collections.PRODUCT_COLLECTION,
          //     let:{prodList:'$products'},
          //     pipeline:[
          //       {
          //         $match:{
          //         $expr:{
          //           $in:['$_id',"$$prodList"]
          //         }
          //       }
          //     }

          //     ],
          //     as:'cartItems'
          //   }
          // }
        ])
        .toArray();
      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
   
    let count = 0;
    return new Promise(async (resolve, reject) => {
      const cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        
          count = cart.products.length;
        
        
      }
    
      resolve(count);
    });
  },

  changeQuantity: (details) => {
    let quantity = parseInt(details.quantity);
    let count = parseInt(details.count);
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },

            { $pull: { products: { item: objectId(details.product) } } }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        console.log("else worked");
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            { $inc: { "products.$.quantity": count } }
          )
          .then((response) => {
            resolve({ removeProduct: false });
          });
      }
    });
  },

  removeProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          { $pull: { products: { item: objectId(details.product) } } }
        )
        .then((response) => {
          resolve({ remove: true });
        });
    });
  },

  totalAmmount: (userId) => {
    console.log(userId+'  this is a user id');
    return new Promise(async (resolve, reject) => {
      const total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group:{_id:null,total:{$sum:{$multiply:['$quantity','$product.price']}}}
          }
          // {
          //   $lookup:{
          //     from:collections.PRODUCT_COLLECTION,
          //     let:{prodList:'$products'},
          //     pipeline:[
          //       {
          //         $match:{
          //         $expr:{
          //           $in:['$_id',"$$prodList"]
          //         }
          //       }
          //     }

          //     ],
          //     as:'cartItems'
          //   }
          // }
        ])
        .toArray();
      resolve(total[0].total);
        
    });
  },
getCartProductList:(userId)=>{
  return new Promise(async(resolve,reject)=>{
    let cart = await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
    resolve(cart.products)
  })
},

placeHolder:(order,products,total)=>{
  return new Promise((resolve,reject)=>{
   let status = order.paymentMethod==='cod'?'placed':'pending'
 let orderObj={
   deliveryDetails:{
   mobile:order.phone,
   address:order.address,
   pincode:order.pincode
   },
   userId:objectId(order.userId),
   paymentMethod:order.paymentMethod,
   products:products,
   status:status,
   date:new Date(),
   total:total
 }
 db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
   db.get().collection(collections.CART_COLLECTION).deleteOne({user:objectId(order.userId)}).then((response)=>{
   })
   resolve(response.ops[0]._id)

 })
  })
},

generateRazorpay:(orderId,totalPrice)=>{
  return new Promise((resolve,reject)=>{
    var options = {
      amount: totalPrice*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: ''+orderId
    };
    instance.orders.create(options, function(err, order) {
      resolve(order)
    });
  })
},


verifyPayment:(details)=>{
  return new Promise((resolve,reject)=>{
   let  crypto = require('crypto');
   let hmac = crypto.createHmac('sha256','8mqUi6vD5IJ1obKeKwUjN1CK')
   hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
   hmac=hmac.digest('hex')
   if(hmac==details['payment[razorpay_signature]']){
     resolve()
   }else{
     reject()
   }
  })
},

changePaymentStatus:(orderId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
  {  
  $set:{
    status:'placed'
  }
  }
    ).then((response)=>{
      console.log(response);
      resolve()
    })
  })
},


viewOrderdProducts:(userId)=>{
  return new Promise(async(resolve,reject)=>{
   let orders = await db.get().collection(collections.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
   resolve(orders)
    })
  },

  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      const orderItems = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },

          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
         
        ])
        .toArray();
      resolve(orderItems);
    });
  },

  cancelOrders: (orderId,proId,userId) => {
    
    return new Promise(async(resolve, reject) => {

    let  products = await db.get().collection(collections.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
      if(products.products.length==1){
        db.get().collection(collections.ORDER_COLLECTION).removeOne({_id:objectId(orderId)})
        resolve()
      }else{
        db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
        {$pull:{products:{item:objectId(proId)}}})
        
        resolve()
      }
      
     
        
    });
    
  },
totalPrice:(orderId)=>{
  return new Promise(async (resolve, reject) => {
    const total = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $lookup: {
              from: collections.PRODUCT_COLLECTION,
              localField: "products.item",
              foreignField: "_id",
              as: "product",
            },
          },
          
          
          
         
        ])
        .toArray();
        console.log(total);
    resolve(total);
      
  });
}
};

