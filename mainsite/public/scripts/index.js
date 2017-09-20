var draggingSlider=false; 
var map;
var markerArray=[];
var price="££";
var rating=3;




var defaultRest={
    address: "Unknown",
    name:"Unknown",
    cuisine: [],
    outdoor: "Unknown",
    occasion: [],
    website: "Unknown",
    reviews: [],
    avgRating: 0
}
var chosenRestaurant=defaultRest;

    var initMap=function() {
        var nbc = {lat:  51.51610, lng: -0.12728};
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: nbc
        });
        var marker = new google.maps.Marker({
          position: nbc,
          map: map
        });
        markerArray.push(marker);
      }


/*
    var addMarkers=function(markerAdd){
            
            for(var i=0; i<markerAdd.length;i++){
                restaurants[markerAdd[i].name]=markerAdd[i];
                var location= markerAdd[i].address;
                console.log("location is ", location);
                location=location.replace(/ /g, "+");
                console.log("replaced location is ", location);
                var call="https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyADp-Jxh-mAwZfWqI8bGvF25t8glrMhpRk"
                console.log(call);
                httpGetAsync(call,  i);
            }

            function httpGetAsync(theUrl,  index){
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function() { 
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                        addMark(xmlHttp.responseText, index);
                }
                xmlHttp.open("GET", theUrl, true); // true for asynchronous 
                xmlHttp.send(null);
            }       

           var addMark= function(latlng, index){
               window.lat=JSON.parse(latlng);
               var latlng=JSON.parse(latlng).results[0].geometry.location;
                console.log("we got back", latlng);
                
                var marker= new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: markerAdd[index].name
                });
                marker.addListener('click', clickRestaurant);
                markerArray.push(marker);
            };            
    }
*/
    //Has to be outside document.ready so can be accessed by angular
    var popUpRest=function(){
        $("#restaurantPopUp").css({top:"100%"});

        //Configure display of restaurant INFO
        //Setup min height according to info
        $('#restaurantPopUp').css({"min-height":0});
        var h=$('#restaurantPopUp').outerHeight();
        $('#restaurantPopUp').css({"min-height":h});
        $("#restaurantInfo").css({"display":"block"});
        $("#reviews").css({"display":"none"});
        $("#infoBtn").css({"background-color":"#3A4D9E"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});        
    }

$(document).ready(function(){ 

    //Click off restaurant pop up, stop propagation
    $("#views, #filters").click( function () {
        $("#restaurantPopUp").css({top:"200%"});
    }); 

    
    //Handle click events associated with pop up Restaurant Info

    $("#infoBtn").click(function(){
        $("#restaurantInfo").css({"display":"block"});
        $("#reviews").css({"display":"none"});
        $("#infoBtn").css({"background-color":"#3A4D9E"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});
    });
    $("#reviewsBtn").click(function(){
        $("#restaurantInfo").css({"display":"none"});
        $("#reviews").css({"display":"block"});
        $("#infoBtn").css({"background-color":"#3a3a3a"});
        $("#reviewsBtn").css({"background-color":"#3A4D9E"});
    });



    $("input:checkbox").click(function() {
        $(this).parent().toggleClass("checked");
    });
    $( ".filter" ).each(function() {
        var n=$(this).children(".point").length-1;
        $(this).children(".point").each(function( index ) {
            var leftOffset= (70/n)*(index) +15;
            $(this).css({"left": leftOffset + "%" });
        });
    });

    $('#map-view').css({"color":"#212121", "background-color":"white" });
    //Handle main clicking menu choices
    $('#map-view').click(function(){
        $("#map").css({"display":"block"});
        $("#submit").css({"display":"none"});
        $('#map-view').css({"color":"#212121", "background-color":"white" });
        $('#add-view').css({"color":"white", "background-color":"#212121" });
    })
    $('#add-view').click(function(){
        $("#map").css({"display":"none"});
        $("#submit").css({"display":"block"});
        $('#add-view').css({"color":"#212121", "background-color":"white" });
        $('#map-view').css({"color":"white", "background-color":"#212121" });
        $(window).resize();
    })
    
    $('.page').mouseover(function(){
        
        if($(this)[0].style.backgroundColor!="rgb(255, 255, 255)"){
            console.log("mouse over",$(this)[0].style.backgroundColor );
            $(this).css({"background-color": "#121212"});
        }
    });
    $('.page').mouseout(function(){
        
        if($(this)[0].style.backgroundColor!="rgb(255, 255, 255)"){
            console.log("mouse out",$(this)[0].style.backgroundColor );
            $(this).css({"background-color": "#212121"});
        }
    });

    //Handle clicking of dropdown filters
    $('.filter').click(function(){
        var childDrop=$(".dropdown[name='"+$(this).attr('id')+"']");
        
        //If there exists a child dropdown
        
        if(childDrop.length){
            if(childDrop.css('display')=="none"){
                childDrop.slideDown();
                $(this).children('i').css({"transform":"rotate(180deg)"});
            }else{
                childDrop.slideUp();
                $(this).children('i').css({"transform":"rotate(0deg)"});
            }
        }
    });




    //Handling ball dragging along slide scale
    $('.filter .ball').mousedown(function() {
        draggingSlider = true;
        console.log("ball clicked");
        var ball=$(this);
        var origLeft=ball.position().left;
        var outer=ball.parent().outerWidth();
   

        $(document).mousemove(function(e) {
            var origLeft=ball.position().left;
            console.log("moved");
            if(draggingSlider){
                ball.parent().children('.point').each(function(){
                    if(Math.abs(e.clientX-$(this).position().left)< Math.abs(e.clientX-origLeft)){
                        console.log("new min. Ball:", ball.position().left, $(this).position().left);
                        ball.css('left',(($(this).position().left)/outer*100)+'%' );
                        origLeft=ball.position().left;
                        
                    }
                });
            }
            return false;
        });

        $(document).one('mouseup', function() {
            draggingSlider=false;
            $(document).unbind();
        });
        return false;

    });



});