var db = require("../config/connection");
var collection = require("../config/collections");
const collections = require("../config/collections");
const objectId = require('mongodb').ObjectID;
const { response } = require("express");
module.exports = {
  addProduct: (proName,proCategory,proPrice, callback) => {
     proPrice = parseInt(proPrice)
     let proDetails={
       name:proName,
       category:proCategory,
       price:proPrice
     }
    console.log(proDetails);
    db.get()
      .collection(collections.PRODUCT_COLLECTION)
      .insertOne(proDetails)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },
  getAllproducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },


deleteProduct:(proId)=>{
return new Promise((resolve,reject)=>{
  db.get().collection(collections.PRODUCT_COLLECTION).remove({_id:objectId(proId)}).then((response)=>{
    resolve(response)
  })
})
},

getOneProduct:(proId)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
      resolve(response)
    })
  })
},

editProduct:(proId,data)=>{
  let price = parseInt(data.price)
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.PRODUCT_COLLECTION).update({_id:objectId(proId)},{
      $set:{
    name:data.name,
    category:data.category,
    price:price

      }
    }).then((response)=>{
      resolve(response)
    })
  })
},


getOrdersDetails:()=>{
  return new Promise(async(resolve,reject)=>{
  let orders = await  db.get().collection(collections.ORDER_COLLECTION).aggregate([
    {
      $unwind: "$products",
    },
    {
      $lookup:{
        from:collections.PRODUCT_COLLECTION,
        localField:"products.item",
        foreignField:"_id",
        as:'product'
      }
    },

    {
      $unwind:'$product'
    }
    
  ]).toArray()
 resolve(orders)
  console.log(orders);
  })

},

getAllUsers:()=>{
  return new Promise(async(resolve,reject)=>{
    let allUsers = await db.get().collection(collections.USER_COLLECTION).find().toArray()
    resolve(allUsers)
  })
},


deleteUser:(userId)=>{
  console.log(userId,'userrrrrrrrrrrrrrrrrrrr');
  return new Promise((resolve,reject)=>{
    db.get().collection(collections.USER_COLLECTION).removeOne({_id:objectId(userId)}).then((reponse)=>{
      console.log(response);
    })
    resolve()
  })
},

getAllUserProducts:(orderId)=>{
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
              as: "products",
            },
          },
          {
            $unwind:'$products'
          
          }
          
         

        ])
        .toArray();
        console.log(total);
    resolve(total);
      
  });
}

}




