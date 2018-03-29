var mainApplicationModuleName= 'eaHelper';
var mainApp= angular.module(mainApplicationModuleName, ['rzModule', 'ui.bootstrap', 'ngMaterial', 'ngMessages']);


var baseColor=  "#400095" ; //"#2196dc"; //#3A4D9E "#400095"
var highColor=  "#8000c5";//6000B5 "#8000c5";


/***********Services/Factories*********************************
// Object whose API is determined by the developer
****************************************************************/

//Get distinct areas and food categories, occasions in database
//All get sent to same express route, url determines distinct property collected
mainApp.factory('areaOptions', ['$http', function($http){
    return $http.get('/area');
}]);
mainApp.factory('catOptions', ['$http', function($http){
    return $http.get('/cuisine');
}]);
mainApp.factory('occasionOptions', ['$http', function($http){
    return $http.get('/occasion');
}]);

//Factory function to get latitude, longitude using address
mainApp.factory('googleURL', ['$http',  function($http){
    var googleLat={};
    googleLat.getLatLng=function(urlG){
       return $http.get(urlG);  
    }
    return googleLat;
}]);

//Factory function used to submit new restaurant data to database
mainApp.factory('submitRest', ['$http',  function($http){
    var newRes={};
    newRes.sendData=function(rest){
        return $http.post('/submitRestaurant',{data:rest});       
    }
    return newRes;
}]);


//Factory function used to edit restaurant data on database
mainApp.factory('editRest', ['$http',  function($http){
    var editRes={};
    editRes.sendData=function(rest){
        return $http.post('/editRestaurant',{data:rest});     
    }
    return editRes;
}]);

//Factory function used to delete restaurant data on database via name
mainApp.factory('deleteRest', ['$http',  function($http){
    var deleteRes={};
    deleteRes.deleteData=function(rest){
        return $http.post('/deleteRestaurant',{data:rest});         
    }
    return deleteRes;
}]);

//Factory function used to submit new restaurant reviews to database
mainApp.factory('reviewRest', ['$http',  function($http){
    var reviewRes={};
    reviewRes.sendData=function(rest){
        return $http.post('/reviewRestaurant',{data:rest});     
    }
    return reviewRes;
}]);

//Get all matching restaurants to current filter settings
mainApp.factory('restaurantsAvail', ['$http', function($http){
    var restaurants={};
    restaurants.getRestaurants=function(restProperties){
        return $http({
            url:'/restaurantsAvail',
            method:'GET',
            params: {props:restProperties}
        });
    }
    return restaurants;    
}]);

/****************Custom Directives*************************************************
//return object, specify require ngModel (ngModelController)
//make linking function mCtrl is ngModelController
//specify validation function, takes input value as input
//set validity of model controller to either true/false
//ass myValidation funct to array, executed every time value changes
********************************************************************************/

//Validation Functions *****************************

//Check length of form entry is greater than 2
mainApp.directive("minLength", function(){
    return {
        require:"ngModel",
        link: function(scope, element, attr, mCtrl){
            function myValidation(value){
                if(value.length<2){
                    mCtrl.$setValidity('lengthName', false);
                }else{
                    mCtrl.$setValidity('lengthName', true);
                }
                return value;
            }
            mCtrl.$parsers.push(myValidation);
        }
    };
});

//Phone numbers are 11 numbers long
//Trims non whitespace
mainApp.directive("phoneLength", function(){
    return {
        require:"ngModel",
        link: function(scope, element, attr, mCtrl){
            function myValidation(value){
                var trimVal= value.replace(/\s/g,'');
                if(  trimVal.length!=11){
                    mCtrl.$setValidity('lengthName', false);
                }else{
                    mCtrl.$setValidity('lengthName', true);
                }
                return value;
            }
            mCtrl.$parsers.push(myValidation);
        }
    };
});

//Sets the circle percentage of the rating display in popup restaurant info
mainApp.directive('backImg', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            if(value<=180){
                value=value-90;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, '+ baseColor+' 50%, transparent 50%),linear-gradient(-90deg,'+baseColor+'  50%, transparent 50%)'
                });
            }else{
                value=value-270;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, '+highColor+' 50%, transparent 50%),linear-gradient(-90deg, '+highColor+'  50%, transparent 50%)'
                });
            }
        });
    };
});


//Sets the circle percentage of the rating display in restaurant lists info
mainApp.directive('backImglist', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImglist', function(value) {
            value=value/5*360;
            if(value<=180){
                value=value-90;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, '+baseColor+' 50%, transparent 50%),linear-gradient(-90deg, '+baseColor+'  50%, transparent 50%)'
                });
            }else{
                value=value-270;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg,'+highColor+' 50%, transparent 50%),linear-gradient(-90deg, '+highColor+'  50%, transparent 50%)'
                });
            }
        });
    };
});

//Return exponential of scope
mainApp.directive('labelStyle', function($interpolate){
    return function(scope, elem){
        var   exp=$interpolate(elem.html()),
              watchFunc= function(){ return exp(scope);};
        scope.$watch(watchFunc, function(html){
            elem.html(html);
        });
    };
});

mainApp.controller('mainController',['$scope', '$timeout', 'areaOptions','catOptions', 'restaurantsAvail', 'googleURL','submitRest', 'occasionOptions', 'editRest', 'deleteRest', '$mdToast',function($scope, $timeout, areaOptions, catOptions, restaurantsAvail, googleURL, submitRest, occasionOptions, editRest, deleteRest, $mdToast){
    var self=this;
    self.readonly=true;
    self.removeable=true;

    var restaurants=[];
    $scope.searchText="";
    $scope.catOptions=[];
    $scope.occasionOptions=[];
    
    $scope.restaurantList=[];
    $scope.restaurantListReduce=[];
    $scope.searchListText="";
    
    $scope.chosenRestaurantEditSubmitResult="";
    $scope.chosenRestaurantSubmitResult="";

    var initializing = true;

    $scope.listOrder="name";
    $scope.listOrderOptions=[{name: "Name",code:"name", reverse: false},{name:"Price- lowest to highest", code:"price", reverse: false}, {name:"Rating- lowest to highest", code:"avgRating", reverse: false}, {name:"Rating- highest to lowest", code:"reverseAvgRating", reverse: true}];

    $scope.newReview="";
    $scope.currentRestaurantView="Info"; //info, review, edit
    $scope.editRestaurantFlag=true;

    var restQualities=["address", "name", "occasion", "cuisine", "outdoorSeating", "website", "review", "avgRating", "price", "rating", "area", "phone"];
    $scope.priceOptions= ["£5-20", "£20-50", "£50+"];
    $scope.outdoorSeatingOptions=["Yes", "No"];

    //Default representation for a restaurant
    var defaultRest={
        address:"",
        area:"",
        name:"",
        rating:[],
        review:[],
        cuisine:[],
        occasion:[],
        outdoorSeating:"",
        price: "",
        website:"",
        phone:""
    };
    $scope.chosenRestaurant=defaultRest;
    $scope.newRestaurant=defaultRest;
    $scope.editRestaurant=defaultRest;

    $scope.newRestaurantArea=[];
    $scope.newRestaurantReview="";

/*
    $scope.ratings_bar = {
        value: 1,
        options: {
            floor:1,
            ceil:5,
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(val){ return baseColor}
        }
    };
    */

    $scope.restaurantRatingSlider={
        value: 1,
        options:{
            floor:1,
            ceil:5,
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(val){ return baseColor}   
        }
    };
    $scope.restaurantReviewSlider={
        value:3,
        options:{
            floor:1,
            ceil:5,
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(val){ return baseColor}
        }
    };



    //Controls navigation between edit and info page popup
    $scope.toggleBtn= function(pageType){
        if(pageType=="Edit"){
            $scope.editRestaurantFlag=false;
        }else{
            $scope.editRestaurantFlag=true;
        }  
    }

    //Toggle item into/out of list
    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
    };
    //Does item exist in list?
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    //Clear map of markers
    var clearMap=function(){
        for(i=1; i<markerArray.length; i++){
            markerArray[i].setMap(null);
        }
        markerArray=[markerArray[0]];
    }

    //Handle click on restaurant map marker
    //Changes chosen restaurant details, 
    $scope.clickRestaurant=function(){
        var name=$(this)[0].title;
        $scope.chosenRestaurant={};

        //Set chosenRestaurant properties, with capitalization etc
        for( var k in restQualities){
            var key= restQualities[k];
            //Key Value has not been set, dont add to chosenRestaurant information
            if(!restaurants[name].hasOwnProperty(key) && key!="avgRating" ){
                continue;
            } 
            switch(key){
                case "address":
                case "website":
                case "price":
                case "avgRating":
                case "outdoorSeating":
                case "area":
                case "phone":
                    $scope.chosenRestaurant[key] = (!restaurants[name].hasOwnProperty(key) || restaurants[name][key]===null || restaurants[name][key]==="" || restaurants[name][key]===0) ? "-" : restaurants[name][key];
                    break;
                    
                case "occasion":
                case "cuisine":
                    var propArray=[];
                    for(var prop in restaurants[name][key] ){
                        propArray.push(restaurants[name][key][prop].capitalize());
                    }
                    $scope.chosenRestaurant[key] = (propArray==null) ? [] : propArray;
                    break;
                case "name":
                    $scope.chosenRestaurant[key] = restaurants[name][key].capitalize();
                    break;
                default:
                    $scope.chosenRestaurant[key] = restaurants[name][key];
            }
            if($scope.chosenRestaurant.avgRating!="-"){
                var am=Math.round(($scope.chosenRestaurant.avgRating/5)*360);
                $scope.avgRatingPercent=am;           
            }else{
                $scope.avgRatingPercent=0;
            }

        }
        
        //Handle the processing of the gathered info from the db
        //Load up chosen restaurant information into restaurant info popup
        $scope.editRestaurant=JSON.parse(JSON.stringify($scope.chosenRestaurant));

        //Clear previous submission messages 
        $scope.reviewSubmitResult="";
        $scope.chosenRestaurantSubmitResult="";
        $scope.chosenRestaurantEditSubmitResult="";

        //Default entry is info
        $scope.editRestaurantFlag=true;
        $scope.$apply() ;
    };

    //Remove from databse, associative array used for markers, marker, restaurantList
    $scope.removeItem=function(name){
        delete restaurants[name];
        $scope.restaurantList = $scope.restaurantList.filter(function( obj ) {
            return obj.name !== name;
        });
        //Remove restaurant from map
        for(var i=0; i< markerArray.length; i++){
            if(markerArray[i].title==name){
                markerArray[i].setMap(null);
                markerArray.splice(i,1);
                break;
            }
        }
        //Remove restaurant from database
        deleteRest.deleteData(name).success(function(data){
            $scope.deleteResult="Restaurant successfully removed"; 
        }).error(function(error,status){
            console.log(error);    
            $scope.deleteResult="Restaurant not removed."
        });        
    }

    //When edit/review buttons clicked from list view
    $scope.changeChosenRestaurant=function(name){
        $scope.editRestaurantFlag=false;
        $scope.chosenRestaurant=restaurants[name];
        var am=Math.round(($scope.chosenRestaurant.avgRating/5)*360);
        $scope.avgRatingPercent=am;
        $scope.editRestaurant=JSON.parse(JSON.stringify($scope.chosenRestaurant));
    }
 

    /**********************************************************
        Handles submitting new restaurants, editing restaurant and adding reviews
        Sending to database,  updating restaurants array
     **************************************************************/
 
    //Submit restaurant review, add review info to chosenrestaurant
    //Then send new form to be added to database
    $scope.submitRestaurantReview=function(){
        if(restaurantReviewForm.review.$invalid){
            $scope.reviewSubmitResult="Review information not complete."
        }else{
            $scope.chosenRestaurant.review.push($scope.newReview);
            $scope.chosenRestaurant.rating.push($scope.restaurantReviewSlider.value);

            //Save old rating values in case of error
            var noRatings= $scope.chosenRestaurant.rating.length;
            var oldRating=$scope.chosenRestaurant.avgRating;
            //Change avg rating percent for rating dial
            $scope.chosenRestaurant.avgRating= $scope.chosenRestaurant.rating.reduce(function(a,b){return a+b;})/noRatings;
            var am=Math.round($scope.chosenRestaurant.avgRating/5*360);
            $scope.avgRatingPercent=Math.round(am);
            
            //Send restaurant data with added reviews to database
            //If successful load new chosen restaurant to array, clear form
            //Else reload old raings 
            editRest.sendData($scope.chosenRestaurant).success(function(data){
                $scope.reviewSubmitResult="Reviews successfully added to restaurant information.";
                restaurants[$scope.chosenRestaurant.name]=$scope.chosenRestaurant;
                newReview="";
                $scope.restaurantReviewSlider.value=3;
            }).error(function(error,status){
                console.log(error);
                $scope.chosenRestaurant.avgRating=oldRating;
                $scope.chosenRestaurat.review.pop();
                $scope.chosenRestaurat.rating.pop();
                $scope.reviewSubmitResult="Reviews not successfully added to restaurant information."

            });
        }
    }

    //Submit new restaurant to database
    $scope.submitRestaurant=function(){
        //Should never occur due to front-end form handling
        if(restaurantSubmissionForm.address.$invalid || restaurantSubmissionForm.name.$invalid ){//!$scope.restaurantSubmissionForm.$valid
            $scope.chosenRestaurantSubmitResult="Restaurant information is not valid."
        }else{
            
            $scope.newRestaurant.rating=[];
            $scope.newRestaurant.review=[];
            $scope.newRestaurant.review.push($scope.newRestaurantReview);
            $scope.newRestaurant.rating.push($scope.restaurantRatingSlider.value);
            
            //Changing to newRest, chosenRestaurant needs to remain with form selector valid price
            var newRest= JSON.parse(JSON.stringify($scope.newRestaurant));
            var priceAct={"£5-20": "£", "£20-50":"££", "£50+": "£££"};
            newRest.price= priceAct[$scope.newRestaurant.price];

            //Submit new restaurant, if successful, add newRest to restaurants, (even though might not meet criteria)
            submitRest.sendData(newRest).success(function(data){
                $scope.chosenRestaurantSubmitResult="Restaurant information successfully added."
                restaurants[$scope.newRestaurant.name]=newRest;
                $scope.newRestaurant=defaultRest;
                $scope.restaurantRatingSlider.value=3;
                $scope.reduceRestaurantList();
            }).error(function(error, status){
                console.log(error);
                $scope.chosenRestaurantSubmitResult="Restaurant information not added due to internal error."
            });
        }
    }

    //Submit edit to pre-existing restaurant
    $scope.editSubmitRestaurant=function(){
        //Should always be valid as pre-handled in front-end
        if(restaurantEditForm.address.$invalid ){
            $scope.chosenRestaurantEditSubmitResult="Restaurant information is not valid."
        }else{
            //Successfully submit, then reduce restaurant list, in case changes whetehr restaurant eligible
            editRest.sendData($scope.editRestaurant).success(function(data){
                $scope.chosenRestaurantEditSubmitResult="Restaurant information successfully changed."
                $scope.chosenRestaurant=JSON.parse(JSON.stringify($scope.editRestaurant));
                restaurants[$scope.chosenRestaurant.name]=$scope.chosenRestaurant;
                $scope.reduceRestaurantList();
            }).error(function(error, status){
                console.log(error);
                $scope.chosenRestaurantEditSubmitResult="Restaurant information not changed due to internal error."
            });
        }
    }

    //Adds function to string prototype to capitalise word
    String.prototype.capitalize = function() {
        var arr= this.split(" ");
        for(var i=0; i<arr.length;i++){
            arr[i]=arr[i].charAt(0).toUpperCase()+arr[i].slice(1);
        }
        return arr.join(" ");
    }

    //Add array of markers to map,
    //Get restaurant name, convert address to lat, lng, add event listeners
    var addMarkers=function(markerAdd){   
            restaurants=[];
            var newestMark;
            for(var i=0; i<markerAdd.length;i++){
                //add marker to list of restaurants
                restaurants[markerAdd[i].name]=markerAdd[i];
                //get address of marker
                var location= markerAdd[i].address;
                location=location.replace(/ /g, "+");
                var call="https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyADp-Jxh-mAwZfWqI8bGvF25t8glrMhpRk";
                googleURL.getLatLng(call).success((function(index,data){
                    if(data.results.length>=1){
                        var latlng=data.results[0].geometry.location;
                        var marker= new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: markerAdd[index].name
                        });
                        marker.addListener('click', $scope.clickRestaurant);
                        marker.addListener('click', popUpRest);
                        markerArray.push(marker);
                    }else{
                        console.log("No lat lngs found for address", location);
                    }
                }).bind(null,i)).error(function(data,status){
                    console.log(data, status);
                });
            }
    }




    

    /**********************************************************
        Handles querysearch and filters lists: autocomplete dropdown/ restaurant list
     **************************************************************/

    //Filters list of restaurants by search bar
    //restaurantListReduce is basis for list display page
    $scope.reduceRestaurantList=function(){
        if($scope.searchListText=="") $scope.restaurantListReduce=JSON.parse(JSON.stringify($scope.restaurantList));
        else $scope.restaurantListReduce=$scope.querySearch($scope.searchListText, "list");
    }

    //Search for options for autocorrect 
    //general purpose for categories, occasions, areas and restaurant list
    $scope.querySearch=function(criteria, type) {
        console.log(criteria);
        console.log("CatOptions are:" , $scope.catOptions);
        var categories;
        if(!criteria) return [];
        switch(type){
            case 'cat':
                categories= $scope.catOptions.filter(createFilterFor(criteria));
                break;
            case 'occ':
                categories= $scope.occasionOptions.filter(createFilterFor(criteria));
                break;
            case 'area':
                categories= $scope.areaOptions.filter(createFilterFor(criteria));
                break;
            case 'list':
                categories= $scope.restaurantList.filter(createFilterFor(criteria));
                return categories;
        }
        var reducedCriteria=categories.map(function(a){return a.name});
        return criteria ? reducedCriteria : [];
    }

    //creates filter 
    //function takes option, states whether query is in option
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(cuisine) {
        return (cuisine.name.toLowerCase().indexOf(lowercaseQuery) != -1);
      };
    }

    //Determines key value for ordering restaurants based  on listOrder.code
    $scope.returnOrderValue=function(card){
        switch($scope.listOrder.code){
            case "price":
                if(card.price=="") return 10
                else return card.price.length
            case "name":
                return card.name
            case "avgRating":
                return card.avgRating
            case "reverseAvgRating":
                return -card.avgRating
        }
    }

    //If chip is simply name, converts to suitable chip format
    //For md-materials framework
    $scope.transformChip=function(chip){
        if(angular.isObject(chip)){return chip;}
        var res={name:chip};
        return res;
    }

    /********************************************
     //Button to delete restaurants from restaurant list
     ************************************************/
    
    //Toast button positioning
    var last = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };
    $scope.toastPosition = angular.extend({},last);

    $scope.getToastPosition = function() {
        sanitizePosition();
        return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };

    function sanitizePosition() {
        var current = $scope.toastPosition;
        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;
        last = angular.extend({},current);
    }

    //Controls what is shown
    $scope.showActionToast = function(name) {
        var pinTo = $scope.getToastPosition();
        var toast = $mdToast.simple()
            .textContent('Are you sure you want to delete', name,'?')
            .action('DELETE')
            .highlightAction(true)
            .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
            .position(pinTo);

        //If toast is confimed call $scope.removeItem, removes restaurant
        $mdToast.show(toast).then(function(response) {
            if ( response == 'ok' ) {
                $scope.removeItem(name);
            }
        });
    };


    
    /***********************************************************************
     * Initializing filters:  dropdowns and price/ratings bars
     ********************************************************************/

    //area, food categories and occasions promises, that retrieve options from database
    areaOptions.success(function(data){
        $scope.areaOptions=[];
        for(var i=0; i< data.length;i++){
            $scope.areaOptions[i]={name: data[i], selected:false};
        }
    }).error(function(data,status){
        console.log(data, status);
        $scope.areaOptions=[];
    });

    catOptions.success(function(data){
        $scope.catOptions=[];
        for(var i=0; i< data.length;i++){
            $scope.catOptions[i]={name: data[i], selected:false};
        }
    }).error(function(data,status){
        console.log(data, status);
        $scope.catOptions=[];
    });

    occasionOptions.success(function(data){
        $scope.occasionOptions=[];
        for(var i=0; i< data.length;i++){
            $scope.occasionOptions[i]={name: data[i], selected:false};
        }
    }).error(function(data,status){
        console.log(data, status);
        $scope.occasionOptions=[];
    });
   
   
    //price and ratings slider
    $scope.prices_bar = {
        value: 0,
        options: {
            stepsArray: ["£5-20", "£20-50", "£50+"],
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(value) {
                return baseColor;
            }
        }
    };
    
    $scope.ratings_bar = {
        value: 1,
        options: {
            floor:1,
            ceil:5,
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(val){ return baseColor}
        }
    };
    //Default option is outdoor seating is dont care
    $scope.outdoor=false;

    /**********************************************************************
    // Wait for filter changes, then change map display
    // Requires re-fetching of restaurant list from database according to search functionality.
    ************************************************************************/
    $scope.$watch('[catOptions, areaOptions, outdoor, prices_bar.value, ratings_bar.value, occasionOptions]', function(newValues, oldValues, $scope) {
        
        //Needs to ensure not triggered by filter values initialising, options loaded from server
        if(newValues[1]==undefined || newValues[5]==undefined || newValues[0]==undefined){
            console.log("Currently initializing filter values are currently:", newValues);
            $timeout(function(){
                console.log("Initializing complete after 0.5 sec (guessed)");
                initializing=false;
            },500);
        }else{
            //default , then copy over changed filter values
            var options={
                cats:[], 
                areas:[],
                outdoor:false,
                price:"£",
                rating:0,
                occasion:[]
            };

            var cats=newValues[0];
            var areas=newValues[1];
            var occasions=newValues[5];

            for(var i=0; i<cats.length;i++){
                if(cats[i].selected){
                    options.cats.push(cats[i].name);
                }
            }
            for(var i=0; i<areas.length;i++){
                if(areas[i].selected){
                    options.areas.push(areas[i].name);
                }
            }
            for(var i=0; i<occasions.length;i++){
                if(occasions[i].selected){
                    options.occasion.push(occasions[i].name);
                }
            }
            options.outdoor=newValues[2];
            options.price=newValues[3];
            options.rating=newValues[4];

            //Get list of available restaurants given the user specified options
            restaurantsAvail.getRestaurants(options).success(function(data){
                clearMap();
                if(data!= "No documents found"){
                    console.log("Data was successfully retrieved:", data);
                    $scope.restaurantList=data;
                    $scope.reduceRestaurantList();
                    addMarkers(data);
                }else{
                    console.log("No documents found: ", data);
                }
            }).error(function(data,status){
                console.log("there was an error", data,status);  
            })
        }
    },true);




}]);


