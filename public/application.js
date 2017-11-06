var mainApplicationModuleName= 'eaHelper';

var mainApp= angular.module(mainApplicationModuleName, ['rzModule', 'ui.bootstrap', 'ngMaterial', 'ngMessages']);

//bind function to document, so every time document.ready hit, 
//using bootstrap, starts new angular application
/*
angular.element(document).ready(function(){
    angular.bootstrap(document,
    [mainApp]);
});
*/
// Service
// Object whose API is determined by the developer

//Get distinct areas and food categories in database
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

//Factory function to get latitude, longitude
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

//Factory function used to edit restaurant data on database
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

//Get all matching restaurants
mainApp.factory('restaurantsAvail', ['$http', function($http){
    var restaurants={};
    restaurants.getRestaurants=function(restProperties){
        console.log(restProperties);
        return $http({
                url:'/restaurantsAvail',
                method:'GET',
                params: {props:restProperties}
            });
    }
    return restaurants;
    
}]);

/****************Custom Directives**************************************************/
//return object, specify require ngModel (ngModelController)
//make linking function mCtrl is ngModelController
//specify validation function, takes input value as input
//set validity of model controller to either true/false
//ass myValidation funct to array, executed every time value changes
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

mainApp.directive('backImg', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImg', function(value) {
            
            if(value<=180){
                value=value-90;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%),linear-gradient(-90deg, #3A4D9E  50%, transparent 50%)'
                    //'background-image': 'linear-gradient(0deg,  #6A7DCE 50%, transparent 50%) ,linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%)'
                });
            }else{
                console.log("value is", value);
                value=value-270;
                console.log("value is", value);
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, #3A4D9E 50%, transparent 50%),linear-gradient(-90deg, #3A4D9E  50%, transparent 50%)'
                    //'background-image': 'linear-gradient(0deg,  #6A7DCE 50%, transparent 50%) ,linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%)'
                });
            }
        });
    };
});

mainApp.directive('backImglist', function(){
    return function(scope, element, attrs){
        attrs.$observe('backImglist', function(value) {
            value=value/5*360;
            if(value<=180){
                value=value-90;
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%),linear-gradient(-90deg, #3A4D9E  50%, transparent 50%)'
                    //'background-image': 'linear-gradient(0deg,  #6A7DCE 50%, transparent 50%) ,linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%)'
                });
            }else{
                console.log("value is", value);
                value=value-270;
                console.log("value is", value);
                element.css({
                    'background-image': 'linear-gradient('+value+'deg, #3A4D9E 50%, transparent 50%),linear-gradient(-90deg, #3A4D9E  50%, transparent 50%)'
                    //'background-image': 'linear-gradient(0deg,  #6A7DCE 50%, transparent 50%) ,linear-gradient('+value+'deg, #6A7DCE 50%, transparent 50%)'
                });
            }
        });
    };
});


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

    $scope.listOrder="name";
    $scope.listOrderOptions=[{name: "Name",code:"name", reverse: false},{name:"Price- lowest to highest", code:"price", reverse: false}, {name:"Rating- lowest to highest", code:"avgRating", reverse: false}, {name:"Rating- highest to lowest", code:"reverseAvgRating", reverse: true}];

    $scope.chosenRestaurant={
        address: "Unknown",
        name:"Unknown",
        cuisine: [],
        outdoor: "Unknown",
        occasion: [],
        website: "Unknown",
        reviews: [],
        avgRating: 0,
        rating:[]
    };

    $scope.setOrder=function(name){
        $scope.listOrder=name;
    }

    $scope.newRestaurant={
        address:"",
        area:"",
        name:"",
        rating:[],
        review:[],
        cuisine:[],
        occasion:[],
        outdoorSeating:"",
        price: "",
        website:""
    };
    $scope.editRestaurant={};
    $scope.newRestaurantArea=[];
    $scope.newRestaurantReview="";
    $scope.restaurantRatingSlider={
            value:1,
            options:{
                ceil:5,
                floor:1,
                disabled:true,
                showSelectionBar: true,
                showTicks:true,
                getSelectionBarColor: function(val){ return "#3A4D9E"}
                }
    };
    $scope.restaurantReviewSlider={
            value:1,
            options:{
                ceil:5,
                floor:1,
                showSelectionBar: true,
                showTicks:true,
                getSelectionBarColor: function(val){ return "#3A4D9E"}
                }
    };
    $scope.newReview="";




    var restQualities=["address", "name", "occasion", "cuisine", "outdoorSeating", "website", "review", "avgRating", "price", "rating"];
    $scope.priceOptions= ["£5-20", "£20-50", "£50+"];
    $scope.outdoorSeatingOptions=["Yes", "No"];


    var clearMap=function(){
        for(i=1; i<markerArray.length; i++){
            markerArray[i].setMap(null);
        }
        markerArray=[markerArray[0]];
    }

    //Handle transfer info from chosen restaurant to edit restaurant
    $scope.editRestaurantFill=function(){
        $scope.editRestaurant=JSON.parse(JSON.stringify($scope.chosenRestaurant));
    }

    //Handle marker click
    //Changes chosen restaurant
    $scope.clickRestaurant=function(){
        var name=$(this)[0].title;
        $scope.chosenRestaurant={};

        for( var k in restQualities){
            var key= restQualities[k];
            if(!restaurants[name].hasOwnProperty(key)){
                console.log("Restaurant does not have property", key);
                continue;
            } 

            switch(key){
                case "address":
                case "website":
                case "price":
                case "avgRating":
                case "outdoorSeating":
                    $scope.chosenRestaurant[key] = (restaurants[name][key]===null || restaurants[name][key]==="" || restaurants[name][key]===0) ? "-" : restaurants[name][key];
                    break;
                case "occasion":
                case "cuisine":
                    var propArray=[];
                    for(var prop in restaurants[name][key] ){
                        propArray.push(restaurants[name][key][prop].capitalize());
                    }
                    $scope.chosenRestaurant[key] = (propArray==null) ? [] : propArray;
                    console.log("the array of", key, "is ", propArray);
                    break;
                case "name":
                    $scope.chosenRestaurant[key] = restaurants[name][key].capitalize();
                    break;
                default:
                    $scope.chosenRestaurant[key] = restaurants[name][key];
                
            }
            if($scope.chosenRestaurant.avgRating!="-"){
                var am=Math.round($scope.chosenRestaurant.avgRating/5*360);
                $scope.avgRatingPercent=am;           
            }else{
                $scope.avgRatingPercent=0;
            }
        }
        
        //Handle the processing of the gathered info from the db
        
        
        console.log(name);
        console.log(restaurants[name]);
        console.log($scope.chosenRestaurant);
        $scope.$apply() ;
    };

    //remove from databse, associative array used for markers, marker, restaurantList
    $scope.removeItem=function(name){
        delete restaurants[name];
        $scope.restaurantList = $scope.restaurantList.filter(function( obj ) {
            return obj.name !== name;
        });
        for(var i=0; i< markerArray.length; i++){
            if(markerArray[i].title==name){
                markerArray[i].setMap(null);
                markerArray.splice(i,1);
                break;
            }
        }

        deleteRest.deleteData(name).success(function(data){
            $scope.deleteResult="Restaurant successfully removed"; 
        }).error(function(error,status){
            console.log(error);    
            $scope.reviewSubmitResult="Restaurant not removed."
        });        
        

    }
    $scope.changeChosenRestaurant=function(name){
        $scope.chosenRestaurant=restaurants[name];
        $scope.editRestaurant=$scope.chosenRestaurant;
    }
//|| $scope.restaurantSubmissionForm.price.$error.required || $scope.restaurantSubmissionForm.outdoor.$error.required

   
    
    $scope.submitRestaurantReview=function(){
        if(restaurantReviewForm.review.$invalid){
            $scope.reviewSubmitResult="Review information not complete."
        }else{
            $scope.chosenRestaurant.review.push($scope.newReview);
            console.log($scope.chosenRestaurant);

            $scope.chosenRestaurant.rating.push($scope.restaurantReviewSlider.value);
            //avgRating should never be passed to database, this is just for other side of edit before filter change refreshes data access
            var noRatings= $scope.chosenRestaurant.rating.length;
            var oldRating=$scope.chosenRestaurant.avgRating;
            $scope.chosenRestaurant.avgRating= $scope.chosenRestaurant.rating.reduce(function(a,b){return a+b;})/noRatings;
            var am=Math.round($scope.chosenRestaurant.avgRating/5*360);
            $scope.avgRatingPercent=Math.round(am);
            //document.getElementById('circlePercent').css({"background-image": "linear-gradient(-90deg, transparent 50%, #6A7DCE 50%),linear-gradient("+270-$scope.chosenRestaurant.avgRating/5*360+"deg, #6A7DCE 50%, transparent 50%)"}); 
            
            console.log("changing circle percent", $scope.chosenRestaurant.avgRating);
            console.log("Changing circle display percent", $scope.avgRatingPercent);
            editRest.sendData($scope.chosenRestaurant).success(function(data){
                $scope.reviewSubmitResult="Reviews successfully added to restaurant information.";
                restaurants[$scope.chosenRestaurant.name]=$scope.chosenRestaurant;
                restaurantReviewForm.reset();
            }).error(function(error,status){
                console.log(error);
                $scope.chosenRestaurant.avgRating=oldRating;
                $scope.reviewSubmitResult="Reviews not successfully added to restaurant information."

            });
        }
    }

    $scope.submitRestaurant=function(){
        if(restaurantSubmissionForm.address.$invalid || restaurantSubmissionForm.name.$invalid ){//!$scope.restaurantSubmissionForm.$valid
            $scope.chosenRestaurantSubmitResult="Restaurant information is not valid."
        }else{
            
            //$mdChipsCtrl.items=[];
            //mdChips remain as $chip in $mdChipsCtrl.items no way to know actual variable name
            $scope.newRestaurant.area=$scope.newRestaurantArea[0];
            $scope.newRestaurant.rating=[];
            $scope.newRestaurant.review=[];
            if($scope.newRestaurantReview!=="") $scope.newRestaurant.review.push($scope.newRestaurantReview);
            if(!$scope.restaurantRatingSlider.options.disabled) $scope.newRestaurant.rating.push($scope.restaurantRatingSlider.value);
            
            var newRest= $scope.newRestaurant;
            var priceAct={"£5-20": "£", "£20-50":"££", "£50+": "£££"};
            newRest.price= priceAct[newRest.price];

            submitRest.sendData($scope.newRestaurant).success(function(data){
                $scope.chosenRestaurantSubmitResult="Restaurant information successfully added."
            }).error(function(error, status){
                console.log(error);
                $scope.chosenRestaurantSubmitResult="Restaurant information not added due to internal error."
            });
            //reset form
            restaurantSubmissionForm.reset(function(){
                $scope.restaurantRatingSlider.options.disabled=true;
            });
            
        }

    }
    $scope.editSubmitRestaurant=function(){
        console.log("the edit restaurant information is", $scope.editRestaurant);
        if(restaurantEditForm.address.$invalid ){
            $scope.chosenRestaurantEditSubmitResult="Restaurant information is not valid."
        }else{
            editRest.sendData($scope.editRestaurant).success(function(data){
                //if(data!=="No documents found"){
                    $scope.chosenRestaurantEditSubmitResult="Restaurant information successfully changed."
                    $scope.chosenRestaurant=JSON.parse(JSON.stringify($scope.editRestaurant));
                    restaurants[$scope.chosenRestaurant.name]=$scope.chosenRestaurant;
                    $scope.reduceRestaurantList();
                //}else{
                //  $scope.chosenRestaurantEditSubmitResult="Restaurant information not successfully changed."   
                //}
            }).error(function(error, status){
                console.log(error);
                $scope.chosenRestaurantEditSubmitResult="Restaurant information not changed due to internal error."
            });
        }
    }
    $scope.chosenRestaurantEditSubmitResult="";
    $scope.chosenRestaurantSubmitResult="";

    String.prototype.capitalize = function() {
        var arr= this.split(" ");
        for(var i=0; i<arr.length;i++){
            arr[i]=arr[i].charAt(0).toUpperCase()+arr[i].slice(1);
        }
        return arr.join(" ");
    }


    var addMarkers=function(markerAdd){   
            restaurants=[];
            var newestMark;
            for(var i=0; i<markerAdd.length;i++){
                //add marker to list of restaurants
                
                restaurants[markerAdd[i].name]=markerAdd[i];
                
                //get address of marker
                var location= markerAdd[i].address;
                location=location.replace(/ /g, "+");
                //console.log("the location searching is", location)
                var call="https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyADp-Jxh-mAwZfWqI8bGvF25t8glrMhpRk"
                //console.log("marker", markerAdd[i])
                googleURL.getLatLng(call).success((function(index,data){
                    //console.log("The lat longitude calculated by Google is: ", data);
                    //console.log("maker again",markerAdd[index]);
                    var latlng=data.results[0].geometry.location;
                    var marker= new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: markerAdd[index].name
                    });
                    marker.addListener('click', $scope.clickRestaurant);
                    marker.addListener('click', popUpRest);
                    markerArray.push(marker);
                }).bind(null,i)).error(function(data,status){
                    console.log(data, status);
                });
            }
    }


    $scope.reduceRestaurantList=function(){
        console.log("search text is", $scope.searchListText)
        console.log("restaurants")
        if($scope.searchListText=="") $scope.restaurantListReduce=JSON.parse(JSON.stringify($scope.restaurantList));
        else $scope.restaurantListReduce=$scope.querySearch($scope.searchListText, "list");

    }

    $scope.returnOrderValue=function(card){
        //console.log($scope.listOrder.code);
        //console.log(card);
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
    

    /**
     * Search for contacts; use a random delay to simulate a remote call
     */

    $scope.querySearch=function(criteria, type) {
        console.log(criteria);
        console.log("CatOptions are:" , $scope.catOptions);
        var categories;
        if(!criteria) return [];
        switch(type){
            case 'cat':
                categories= $scope.catOptions.filter(createFilterFor(criteria));
                console.log("Matching food types are: ", categories);
                break;
            case 'occ':
                categories= $scope.occasionOptions.filter(createFilterFor(criteria));
                console.log("Matching occasion types are: ", categories);
                break;
            case 'area':
                categories= $scope.areaOptions.filter(createFilterFor(criteria));
                console.log("Matching area types are: ", categories);
                break;
            case 'list':
                categories= $scope.restaurantList.filter(createFilterFor(criteria));
                console.log("Matching list types are: ", categories);
                return categories;
        }
        var reducedCriteria=categories.map(function(a){return a.name});
        console.log("Reduced", reducedCriteria);

        return criteria ? reducedCriteria : [];
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(cuisine) {
        return (cuisine.name.toLowerCase().indexOf(lowercaseQuery) != -1);
      };

    }
    $scope.transformChip=function(chip){
        console.log("Transforming chip");
        console.log("chip is", chip);
        if(angular.isObject(chip)){return chip;}
        var res={name:chip};
        console.log(res)
        return res;
    }




    var initializing = true;
    
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
   
    //Style and val of slider visible 
    $scope.prices_bar = {
        value: 0,
        options: {
            stepsArray: ["£5-20", "£20-50", "£50+"],
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(value) {
                return "white";
            }
        }
    };
    
    $scope.ratings_bar = {
        value: 5,
        options: {
            showSelectionBar: true,
            showTicks:true,
            getSelectionBarColor: function(val){ return "white"}
            /* function(value) {
                if (value <= 1)
                    return 'red';
                if (value <= 3)
                    return 'orange';
                if (value <= 4)
                    return 'yellow';
                return '#2AE02A';
            }*/
        }
    };

    $scope.outdoor=false;

    //Wait for filter changes, then change map display
    $scope.$watch('[catOptions, areaOptions, outdoor, prices_bar.value, ratings_bar.value, occasionOptions]', function(newValues, oldValues, $scope) {
        console.log("values changing");
        if(newValues[1]==undefined || newValues[5]==undefined || newValues[0]==undefined){
            console.log("Currently initializingm filter values are currently:", newValues);
            $timeout(function(){
                console.log("Initializing complete after 0.5 sec (guessed)");
                initializing=false;
            },500);
        }else{
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
            console.log('cats', newValues[0]);
            console.log('areas' ,newValues[1]);
            console.log('occasions', newValues[5]);
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

            
            restaurantsAvail.getRestaurants(options).success(function(data){
                clearMap();
                if(data!= "No documents found"){
                    console.log("Data was successfully retrieved:", data);
                    $scope.restaurantList=data;
                    $scope.reduceRestaurantList();
                    addMarkers(data);
                }else{
                    console.log(data);
                }
            }).error(function(data,status){
                console.log("there was an error", data,status);  
            })
        }
    },true);

    //Handles toast delete button
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

    $scope.showActionToast = function(name) {
        var pinTo = $scope.getToastPosition();
        var toast = $mdToast.simple()
            .textContent('Are you sure you want to delete', name,'?')
            .action('DELETE')
            .highlightAction(true)
            .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
            .position(pinTo);

        $mdToast.show(toast).then(function(response) {
            if ( response == 'ok' ) {
                $scope.removeItem(name);
            }
        });
    };


}]);


/* Typically controller of form
mainApp.controller('areaOptions', function($scope){
    $scope.first=1;
});

*/