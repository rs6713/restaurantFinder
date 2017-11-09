var draggingSlider=false; 
var map;
var markerArray=[];
var price="££";
var rating=3;
var nbc = {lat:  51.51610, lng: -0.12728};



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
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: nbc,
          scrollwheel: false
        });
        var image={
            url: './../images/home.png',
            //size: new google.maps.Size(71,71),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(0,0),
            scaledSize: new google.maps.Size(30,30)
        }
        var marker = new google.maps.Marker({
          position: nbc,
          map: map,
          icon: image,//'./../images/home.png',
          title: 'NBC London Main Offices',
          zIndex:1000
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

        $("#mapOverlay").css({"display":"block"});
        $("#restaurantInfo").css({"display":"block"});
        $("#restaurantEdit").css({"display":"none"});
        $("#reviews").css({"display":"none"});

        var h=$('#restaurantPopUp').outerHeight();
        $('#restaurantPopUp').css({"min-height":h});

        $("#infoBtn").css({"background-color":"#3A4D9E"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});    
        $("#editBtn").css({"background-color":"#3a3a3a"});      
    }

    var popRestList=function(popType){
        $("#infoBtn").css({"background-color":"#3a3a3a"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});    
        $("#editBtn").css({"background-color":"#3a3a3a"});  
        $("#restaurantInfo").css({"display":"none"});
        $("#restaurantEdit").css({"display":"none"});
        $("#reviews").css({"display":"none"}); 
        $('#restaurantPopUp').css({"min-height":0});
        $('#mapOverlay').css({"display":"block"});
        switch(popType){
            case "info":
                $("#infoBtn").css({"background-color":"#3A4D9E"});
                $("#restaurantInfo").css({"display":"block"});
                break;
            case "edit":
                $("#editBtn").css({"background-color":"#3A4D9E"});
                $("#restaurantEdit").css({"display":"block"});
                break;
            case "review":
                $("#reviewsBtn").css({"background-color":"#3A4D9E"});
                $("#reviews").css({"display":"block"});
                break;
        }
        var h=$('#restaurantPopUp').outerHeight();
        $('#restaurantPopUp').css({"min-height":h});
        $("#restaurantPopUp").css({top:"100%"});
    }
$(window).resize(function(){
    $('#innerfilters').css({"width" : "100%"});
    if($(window).width()>768){
        
        var w=$('#innerfilters').outerWidth() + $("#innerfilters")[0].offsetWidth-$("#innerfilters")[0].clientWidth;
        $('#innerfilters').css({"width" : w+"px"});    
    }
    $('#listItems').css({"width" : "100%"});
    var w=$('#listItems').outerWidth() + $('#listItems')[0].offsetWidth-$('#listItems')[0].clientWidth;
    $('#listItems').css({"width" : w+"px"});  

    $('#restaurantEditForm').css({"width" : "100%"});
    var w=$('#restaurantEdit').outerWidth() + $('#restaurantEdit')[0].offsetWidth-$('#restaurantEdit')[0].clientWidth;
    $('#restaurantEditForm').css({"width" : w+"px"});  

    map.setCenter(nbc);
});

$(document).ready(function(){ 

    $('#listFilters').css({"display":"none"});

    //var p=$('#innerfilters').outerWidth() - $('#innerfilters').innerWidth() + "px";
    if($(window).width()>768){
        var w=$('#innerfilters').outerWidth() +$("#innerfilters")[0].offsetWidth-$("#innerfilters")[0].clientWidth;
        $('#innerfilters').css({"width" : w+"px"});
    }
    var w=$('#listItems').outerWidth()+ $('#listItems')[0].offsetWidth-$('#listItems')[0].clientWidth;
    $('#listItems').css({"width" : w+"px"}); 

    var w=$('#restaurantPopUp  #restaurantEdit').outerWidth() + $('#restaurantEdit')[0].offsetWidth-$('#restaurantEdit')[0].clientWidth;
    $('#restaurantEditForm').css({"width" : w+"px"}); 

    //Stop pressing enter, prematurely submitting form
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
        event.preventDefault();
        return false;
        }
    });

    //Click off restaurant pop up, stop propagation
    $("#views, #filters, #mapOverlay").click( function () {
        $("#restaurantPopUp").css({top:"200%"});
        $("#mapOverlay").css({"display":"none"});
    }); 

    $("#price #priceQuestion").hover(function(){
        $("#price #priceOverlay").fadeIn(300);//css({"visibility":"visible"});
    });
    $("#price #priceQuestion").mouseleave(function(){
        $("#price #priceOverlay").fadeOut(300);//css({"visibility":"hidden"});
    });

    //Handle click events associated with pop up Restaurant Info
    $("#infoBtn").click(function(){
        $("#restaurantInfo").css({"display":"block"});
        $("#reviews").css({"display":"none"});
        $("#restaurantEdit").css({"display":"none"});
        $("#infoBtn").css({"background-color":"#3A4D9E"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});
        $("#editBtn").css({"background-color":"#3a3a3a"});
    });
    $("#reviewsBtn").click(function(){
        $("#restaurantInfo").css({"display":"none"});
        $("#restaurantEdit").css({"display":"none"});
        $("#reviews").css({"display":"block"});
        $("#infoBtn").css({"background-color":"#3a3a3a"});
        $("#reviewsBtn").css({"background-color":"#3A4D9E"});
        $("#editBtn").css({"background-color":"#3a3a3a"});
         w=$('.currentReviews').outerWidth() +19;
        $('.currentReviews').css({"width" : w+"px"});
    });
    $("#editBtn").click(function(){
        $("#restaurantInfo").css({"display":"none"});
        $("#restaurantEdit").css({"display":"block"});
        $("#reviews").css({"display":"none"});
        $("#infoBtn").css({"background-color":"#3a3a3a"});
        $("#reviewsBtn").css({"background-color":"#3a3a3a"});
        $("#editBtn").css({"background-color":"#3A4D9E"});
        $('#restaurantEditForm').css({"width":"100%"});
        w=$('#restaurantEditForm').outerWidth()+19;
        $('#restaurantEditForm').css({'width':w+'px'});
    });


    $("#filters input:checkbox").click(function() {
        $(this).parent().toggleClass("checked");
    });
    $( ".filter" ).each(function() {
        var n=$(this).children(".point").length-1;
        $(this).children(".point").each(function( index ) {
            var leftOffset= (70/n)*(index) +15;
            $(this).css({"left": leftOffset + "%" });
        });
    });

    $('#map-view').css({"background-color":"#4a4a4a" , "border-top": "3px solid black"});
    //Handle main clicking menu choices
    $('#map-view').click(function(){
        $("#map").css({"display":"block"});
        $("#list").css({"display":"none"});
        $("#submitContainer").css({"display":"none"});
        $('#listFilters').css({"display":"none"});
        $('#map-view').css({"background-color":"#4a4a4a" , "border-top": "3px solid black" });
        $('#list-view').css({"color":"white", "background-color":"#212121" , "border-top":"none"});
        $('#add-view').css({"color":"white", "background-color":"#212121" , "border-top":"none"});
    });
    $('#add-view').click(function(){
        $("#map").css({"display":"none"});
        $("#list").css({"display":"none"});
        $('#listFilters').css({"display":"none"});
        $("#submitContainer").css({"display":"block"});
        $('#add-view').css({ "background-color":"#4a4a4a" , "border-top": "3px solid black" });
        $('#list-view').css({"color":"white", "background-color":"#212121", "border-top":"none" });
        $('#map-view').css({"color":"white", "background-color":"#212121", "border-top":"none" });
        $(window).resize();
    });
    $('#list-view').click(function(){
        $("#map").css({"display":"none"});
        $('#listFilters').css({"display":"block"});
        $("#submitContainer").css({"display":"none"});
        $("#list").css({"display":"flex"});
        $('#map-view').css({"color":"white", "background-color":"#212121", "border-top":"none" });
        $('#add-view').css({"color":"white", "background-color":"#212121", "border-top":"none" });
        $('#list-view').css({ "background-color":"#4a4a4a" , "border-top": "3px solid black" });
        $(window).resize();
    });

    
    $('.page').mouseover(function(){
        //console.log($(this)[0].style);
        console.log("mousey", $(this).css('background-color'));
        //console.log("mouse over",$(this)[0].style.backgroundColor);
        if($(this).css('background-color')!=='rgb(74, 74, 74)'){//rgb(33,33,33) #212121 $(this)[0].style.backgroundColor
            console.log("mousey", $(this).css('background-color'));
            console.log("mouse over",$(this)[0].style.backgroundColor);
            $(this).css({"background-color": "#121212"});
        }
    });

    $('.page').mouseout(function(){      
        //console.log("mouse out",$(this)[0].style.backgroundColor);
        console.log("mousey", $(this).css('background-color'));
        if($(this).css('background-color')!=='rgb(74, 74, 74)'){
            console.log("mouse out",$(this)[0].style.backgroundColor);
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