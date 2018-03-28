var draggingSlider=false; 
var map;
var markerArray=[];
var price="££";
var rating=3;
var nbc = {lat:  51.51610, lng: -0.12728};
var baseColor2="#400095";

    //Initialises google map, with nbc icon at centre
    var initMap=function() {
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: nbc,
          scrollwheel: false
        });
        var image={
            url: './../images/home.png',
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(0,0),
            scaledSize: new google.maps.Size(30,30)
        }
        var marker = new google.maps.Marker({
          position: nbc,
          map: map,
          icon: image,
          title: 'NBC London Main Offices',
          zIndex:1
        });
        markerArray.push(marker);
      }


    //Handles the popup of the restaurant information  when clicked map marker
    //Has to be outside document.ready so can be accessed by angular
    var popUpRest=function(){
        $("#restaurantPopUp").css({top:"100%"});

        //Configure display of restaurant INFO
        //Setup min height according to info
        //$('#restaurantPopUp').css({"min-height":0});

        $("#mapOverlay").css({"display":"block"});
       
        $("#restaurantEdit").css({"display":"block"});
        $("#reviews").css({"display":"none"});

        var h=$('#restaurantPopUp').outerHeight();
        //$('#restaurantPopUp').css({"min-height":h});

        $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":"black"});
        $("#reviewEdit").css({"background-color":baseColor2});
        $("#editEdit").css({"background-color":baseColor2});     
    }

    //Handles popup of  restaurant from list
    var popRestList=function(popType){
        $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":baseColor2});
        $("#reviewEdit").css({"background-color":baseColor2});
        $("#editEdit").css({"background-color":baseColor2});

        $("#restaurantEdit").css({"display":"none"});
        $("#reviews").css({"display":"none"});

        //$('#restaurantPopUp').css({"min-height":0});
        $('#mapOverlay').css({"display":"block"});
        switch(popType){
            case "info":
                $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":"black"});
                $("#restaurantEdit").css({"display":"block"});
                break;
            case "edit":   
                $("#editEdit").css({"background-color":"black"});
                $("#restaurantEdit").css({"display":"block"});
                break;
            case "review":
                $("#reviewEdit").css({"background-color":"black"});
                $("#reviews").css({"display":"block"});
                break;
        }
        var h=$('#restaurantPopUp').outerHeight();
        //$('#restaurantPopUp').css({"min-height":h});
        $("#restaurantPopUp").css({top:"100%"});
    }


//Changes width of filters and forms based on changing screen width.
//Adapts to make scroll bars invisible and recenter nbc marker
$(window).resize(function(){
    $('#innerfilters').css({"width" : "100%"});
    if($(window).width()>768){
        
        var w=$('#innerfilters').outerWidth() + $("#innerfilters")[0].offsetWidth-$("#innerfilters")[0].clientWidth;
        $('#innerfilters').css({"width" : w+"px"});    
    }
    $('#listItems').css({"width" : "100%"});
    var w=$('#listItems').outerWidth() + $('#listItems')[0].offsetWidth-$('#listItems')[0].clientWidth;
    $('#listItems').css({"width" : w+"px"});  
    map.setCenter(nbc);
});

$(document).ready(function(){ 

    //On initialisation, the map is in view
    $('#map-view').css({"background-color":"#200064" , "border-top": "3px solid black"});

    //Make restaurant list filters e.g. search, order by, invisible
    $('#listFilters').css({"display":"none"});

    //Change filter widths so scroll bars not visible on initialisation
    if($(window).width()>768){
        var w=$('#innerfilters').outerWidth() +$("#innerfilters")[0].offsetWidth-$("#innerfilters")[0].clientWidth;
        $('#innerfilters').css({"width" : w+"px"});
    }
    var w=$('#listItems').outerWidth()+ $('#listItems')[0].offsetWidth-$('#listItems')[0].clientWidth;
    $('#listItems').css({"width" : w+"px"}); 

    var w=$('#restaurantPopUp  #restaurantEdit').outerWidth() + $('#restaurantEdit')[0].offsetWidth-$('#restaurantEdit')[0].clientWidth;
    //Finctions on Click restaraunt pop up navigations

    //Change button color
    $("#editEdit").click(function(){
        $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":baseColor2});
        $("#reviewEdit").css({"background-color":baseColor2});
        $("#editEdit").css({"background-color":"black"});
    });
    $("#restaurantPopUp #popHeader #infoEdit").click(function(){
        $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":"black"});
        $("#reviewEdit").css({"background-color":baseColor2});
        $("#editEdit").css({"background-color":baseColor2});        
    });
    $("#reviewEdit").click(function(){
        $("#restaurantPopUp #popHeader #infoEdit").css({"background-color":baseColor2});
        $("#reviewEdit").css({"background-color":"black"});
        $("#editEdit").css({"background-color":baseColor2});
    });

    //Change forms/information visible
    $("#restaurantPopUp #popHeader #editEdit, #restaurantPopUp #popHeader #infoEdit").click(function(){
        $('#restaurantEdit').css({"display":"block"});
        $("#reviews").css({"display":"none"});
    });
    $("#reviewEdit").click(function(){
        $('#restaurantEdit').css({"display":"none"});
        $("#reviews").css({"display":"block"});
    });

    //Stop pressing enter, prematurely submitting form
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
        event.preventDefault();
        return false;
        }
    });

    //Click off restaurant pop up, 
    $("#views, #filters, #mapOverlay").click( function () {
        $("#restaurantPopUp").css({top:"200%"});
        $("#mapOverlay").css({"display":"none"});
    }); 

    //Toggle class checked when outside seating clicked
    $("#filters input:checkbox").click(function() {
        $(this).parent().toggleClass("checked");
    });

    //Handle main clicking menu choices- change between map, list, restaurant submission pages
    $('#map-view').click(function(){
        $("#map").css({"display":"block"});
        $("#list").css({"display":"none"});
        $("#submitContainer").css({"display":"none"});
        $('#listFilters').css({"display":"none"});
        $('#map-view').css({"background-color":"#200064" , "border-top": "3px solid black" });
        $('#list-view').css({"color":"white", "background-color":"#400095" , "border-top":"none"});
        $('#add-view').css({"color":"white", "background-color":"#400095", "border-top":"none"});
    });
    $('#add-view').click(function(){
        $("#map").css({"display":"none"});
        $("#list").css({"display":"none"});
        $('#listFilters').css({"display":"none"});
        $("#submitContainer").css({"display":"block"});
        $('#add-view').css({ "background-color":"#200064" , "border-top": "3px solid black" });
        $('#list-view').css({"color":"white", "background-color":"#400095", "border-top":"none" });
        $('#map-view').css({"color":"white", "background-color":"#400095", "border-top":"none" });
        $(window).resize();
    });
    $('#list-view').click(function(){
        $("#map").css({"display":"none"});
        $('#listFilters').css({"display":"block"});
        $("#submitContainer").css({"display":"none"});
        $("#list").css({"display":"flex"});
        $('#map-view').css({"color":"white", "background-color":"#400095", "border-top":"none" });
        $('#add-view').css({"color":"white", "background-color":"#400095", "border-top":"none" });
        $('#list-view').css({ "background-color":"#200064" , "border-top": "3px solid black" });
        $(window).resize();
    });

    
    //Hover over effects for main page buttons
    $('.page').mouseover(function(){
        if($(this).css('background-color')!=='rgb(32, 0, 100)' && $(this).css('background-color')!=='#200064' ){
            console.log($(this).css('background-color'));
            $(this).css({"background-color": "#6000B5"});
        }
    });

    $('.page').mouseout(function(){      
        if($(this).css('background-color')!=='rgb(32, 0, 100)' && $(this).css('background-color')!=='#200064'){
            $(this).css({"background-color": "#400095"});
        }
    });

    //Handle visuals of clicking on dropdown filters
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

});