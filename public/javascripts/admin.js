$(document).ready(function(){
    $("#search").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });




  $(document).ready(function(){
    $(".search").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#myOrderTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });



function deleteUser(userId){
  
  let r = confirm(' do you want delete?')
if(r==true){
  $.ajax({
    method:'post',
    url:'/admin/delete-user',
    data:{
       user: userId,
    },
    success:(response)=>{
      if(response.status){
      
        location.reload()
      }
       
    }
})
}
  
}








