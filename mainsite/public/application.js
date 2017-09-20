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

mainApp.controller('mainController',['$scope', '$timeout', 'areaOptions','catOptions', 'restaurantsAvail', 'googleURL','submitRest', 'occasionOptions', function($scope, $timeout, areaOptions, catOptions, restaurantsAvail, googleURL, submitRest, occasionOptions){
    var self=this;
    self.readonly=true;
    self.removeable=true;
    var restaurants=[];
    $scope.searchText="";
    $scope.catOptions=[];
    $scope.occasionOptions=[];
    
    $scope.chosenRestaurant={
        address: "Unknown",
        name:"Unknown",
        cuisine: [],
        outdoor: "Unknown",
        occasion: [],
        website: "Unknown",
        reviews: [],
        avgRating: 0
    };

    $scope.newRestaurant={
        address:"",
        area:"",
        name:"",
        rating:0,
        review:"",
        cuisine:[],
        occasion:[],
        outdoorSeating:"",
        price: "",
        website:""
    };

    $scope.restaurantRatingSlider={
            value:5,
            options:{
                showSelectionBar: true,
                showTicks:true,
                getSelectionBarColor: function(val){ return "#3A4D9E"}
                }
    };

    var restQualities=["address", "name", "cuisine", "outdoorSeating", "website", "reviews", "avgRating", "price"];
    $scope.priceOptions= ["£", "££", "£££"];
    $scope.outdoorSeatingOptions=["Yes", "No", "Unknown"];


    var clearMap=function(){
        for(i=1; i<markerArray.length; i++){
            markerArray[i].setMap(null);
        }
        markerArray=[markerArray[0]];
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
                    $scope.chosenRestaurant[key] = (restaurants[name][key]==null || restaurants[name][key]=="" || restaurants[name][key]==0) ? "Unknown" : restaurants[name][key];
                    break;
                case "occasion":
                case "cuisine":
                    var propArray=[];
                    for(var prop in  $scope.chosenRestaurant[key] ){
                        propArray.push(prop.capitalize());
                    }
                    $scope.chosenRestaurant[key] = (propArray==null) ? "Unknown" : propArray;
                    break;
                case "name":
                    $scope.chosenRestaurant[key] = restaurants[name][key].capitalize();
                    break;
                default:
                    $scope.chosenRestaurant[key] = restaurants[name][key];
                
            }
        }
        
        //Handle the processing of the gathered info from the db
        
        
        console.log(name);
        console.log(restaurants[name]);
        console.log($scope.chosenRestaurant);
        $scope.$apply() ;
    };
//|| $scope.restaurantSubmissionForm.price.$error.required || $scope.restaurantSubmissionForm.outdoor.$error.required
    $scope.submitRestaurant=function(){
        if( !$scope.restaurantSubmissionForm.$valid ){//!$scope.restaurantSubmissionForm.$valid
            $scope.chosenRestaurantSubmitResult="Restaurant information not valid."
        }else{
            $scope.newRestaurant.rating=$scope.restaurantRatingSlider.value;
            submitRest.sendData($scope.newRestaurant).success(function(data){
                $scope.chosenRestaurantSubmitResult="Restaurant information successfully added."
            }).error(function(error, status){
                console.log(error);
                $scope.chosenRestaurantSubmitResult="Restaurant information not added due to internal error."
            });
        }

    }
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
                console.log("the location searching is", location)
                var call="https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyADp-Jxh-mAwZfWqI8bGvF25t8glrMhpRk"
                console.log("marker", markerAdd[i])
                googleURL.getLatLng(call).success((function(index,data){
                    console.log("The lat longitude calculated by Google is: ", data);
                    console.log("maker again",markerAdd[index]);
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

    /**
     * Search for contacts; use a random delay to simulate a remote call
     */
    $scope.querySearch=function(criteria) {
        console.log(criteria);
        console.log("CatOptions are:" , $scope.catOptions);
        if(!criteria) return [];
        var categories= $scope.catOptions.filter(createFilterFor(criteria));
        console.log("Matching food types are: ", categories);
        var reducedCat=categories.map(function(a){return a.name});
        console.log("Reduced", reducedCat);
        return criteria ? reducedCat : [];
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
        $scope.areaOptions={};
    });

    catOptions.success(function(data){
        $scope.catOptions=[];
        for(var i=0; i< data.length;i++){
            $scope.catOptions[i]={name: data[i], selected:false};
        }
    }).error(function(data,status){
        console.log(data, status);
        $scope.catOptions={};
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
            stepsArray: ["£", "££", "£££"],
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
        if(newValues[0]==undefined || newValues[1]==undefined ){
            console.log("filters are undefined");
            console.log(newValues);
            $timeout(function(){initializing=false;});
        }else{
            var options={
                cats:[], 
                areas:[],
                outdoor:false,
                price:"£",
                rating:0,
                occasion:[]
            };
            console.log('cats' + newValues[0]);
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
            for(var i=0; occasions.length;i++){
                if(occasions[i].selected){
                    options.occasions.push(occasions[i].name);
                }
            }
            options.outdoor=newValues[2];
            options.price=newValues[3];
            options.rating=newValues[4];

            
            restaurantsAvail.getRestaurants(options).success(function(data){
                
                clearMap();
                if(data!= "No documents found"){
                    console.log("Data was successfully retrieved:", data);
                    addMarkers(data);
                }else{
                    console.log(data);
                }
            }).error(function(data,status){
                console.log("there was an error", data,status);  
            })
        }
    },true);
}]);


/* Typically controller of form
mainApp.controller('areaOptions', function($scope){
    $scope.first=1;
});

*/