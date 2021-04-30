
  


// validation signup page









  $(document).ready(function(){  
    $('#signup-form').validate({
    
              rules:{
           fname:{
               required:true,
               minlength:4
           },
           lname:{
             required:true,
             minlength:4
           },
           phone:{
             required:true,
           },
           email:{
             required:true  
           },
           password:{
                required:true,
                minlength:5
            },
            
            
    
    }
    })
    
})
      
   

// user login with ajax



  
$('#login-form').submit((e) => {
  e.preventDefault()
  console.log('***************');
  let email = $('#email').val()
  let password = $('#password').val()
  
  
  $.ajax({
      url: '/login',
      method: "post",
      data: {
          email,
          password
      },
      success: (response) => {
          if (response.status) {
              window.location.assign('/verify')
          }else if(email=="" && password==""){
          }
           else {
              $('#login-fail').show()
          }
      }
  })
})











// add to cart function with ajax


function addtoCart(proId){
    $.ajax({ 
      
      url:'/addtocart/'+proId,
      method:'get',
      success:(response)=>{
        if(response.status){
          alert('Items added')
  let count = $('#cart-count').html()
       count = parseInt(count)+1
       $('#cart-count').html(count) 
       
        }
      

       
      }
    })
  }


  // change quantity function with ajax

  function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    console.log(userId)
    count=parseInt(count)
    $.ajax({
      url:'/change-productQuantity',
      data:{
        user:userId,
        product:proId,
        cart:cartId,
        count:count,
        quantity:quantity,
      },
      method:'post',
      success:(response)=>{
        if(response.removeProduct){
           alert('Product removed from cart')
           location.reload()
      }else{
        document.getElementById(proId).innerHTML=quantity+count
        document.getElementById('total').innerHTML=response.total
     console.log(response.total);
      }
        
      }
    })
  }


  // remove products in cart 

   function removeProduct(proId,cartId){

     $.ajax({
       url:'/remove-product',
       method:'post',
       data:{
       product:proId,
       cart:cartId
       },
       success:(response)=>{
        if(response.remove){
          alert('Item deleted')
          location.reload()
        }
       }
      
     })
   }

   //remove btn confirm 12345

// let btn = document.querySelector('#rmv-btn')
//    btn.addEventListener('click',function(){
//     alert('hi')
//    }

   



// validation checkout form

  
  // ajax for checkout form

// $(document).ready(()=>{



// $('#checkout-form').on('submit',((e)=>{
//   e.preventDefault()
//   $.ajax({
//     url:'/order-products',
//     method:'post',
//     data:$('#checkout-form').serialize(),
//     success:(response)=>{
//     }
//   })
// }))


// })
// })



  

  $('#checkout-form').validate({
  
            rules:{
         address:{
             required:true,
             minlength:4
         },
         phone:{
           required:true,
           minlength:10
         },
         pincode:{
           required:true,
           maxlength:6
         },
         paymentMethod:{
           required:true
         },
         
         
        },
        messages:{
          paymentMethod:{
            required:'please selecet payment method'
          }
        },

        submitHandler: function(form) {
          $.ajax({
              url: '/order-products',
              type: 'post',
              data: $('#checkout-form').serialize(),
              success: function(response) {
                if(response.codSuccess){
                  location.assign('/orederd')
                }else{
                  razorpayPayment(response)
                 
                }
                  
              }            
          });
      }
          
     
  
  })
  

  function razorpayPayment(order){
    var options = {
      "key": "rzp_test_a0FhXjLxQbDrm5", // Enter the Key ID generated from the Dashboard
      "amount": order.ammount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "Myntra",
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response){
          // alert(response.razorpay_payment_id);
          // alert(response.razorpay_order_id);
          // alert(response.razorpay_signature)

          verifyPayment(response,order)
      },
      "prefill": {
          "name": "Gaurav Kumar",
          "email": "gaurav.kumar@example.com",
          "contact": "9999999999"
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  };
  
  var rzp1 = new Razorpay(options);
  rzp1.open();
  }

   function verifyPayment(payment,order){
    console.log('iiiiiiiiiiiiiiiiiiiiiiii');
  $.ajax({
    url:'/verify-payment',
    method:'post',
    data:{
      payment,
      order
    },
    success:(response)=>{
      if(response.status){
        console.log('if worked');
        location.assign('/orederd')
        
      }
     
    }
  })
  }
  

  
  // cancel order

   function cancelOrder(orderId,proId){
     console.log('****************8888');
  $.ajax({
    url:'/cancel-order',
    method:'post',
    data:{
      orderId,
      proId
    },
    success:(response)=>{
      console.log('ifffffffffffffffffffffffff');
      if(response.status){
        location.assign('/view-orderd-products')
      }
    }
  })
  }
  