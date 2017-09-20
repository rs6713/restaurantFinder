var express = require('express');
var router = express.Router();

/* GET home page. */
// Defines the root route. router.get receives a path and a function
// The req object represents the HTTP request and contains
// the query string, parameters, body, header
// The res object is the response Express sends when it receives
// a request
// render says to use the views/studentlist.jade file for the layout

var mongodb=require('mongodb');

//Post data /
router.post('/',function(req,res,next){
  console.log("post", req.body);
  next();
});



//Update data, / 
router.put('/:id', function(req,res,next){
  //findByIdAndUpdate
  //req.body. req.params.id
  console.log("put", req.params.id);
  console.log(req.body);
  next();
});

//Destroy data /:id
router.delete(':/id',function(req,res,next){
  //findByIdAndRemove(req.params.id, req.body)
  console.log("delete",req.params.id, req.body );
  next();
});

//Method to submit a new restaurant
router.post('/submitRestaurant', function(req, res){
  var data=req.body.data;

    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
  
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/mainsite';
  
    // Connect to the server
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {
        // We are connected
        console.log('Connection established to', url);
    
        // Get the documents collection
        var collection = db.collection('restaurants');
    
        // Find all students
        collection.insert(data, function (err, result) {
          if (err) {
            res.send(err);
          } else if (result.length) {
            //return result
            res.send(result);
          } else {
            console.log("result.length", result.length);
            res.send('No documents found');
          }
          //Close connection
          db.close();
        });
      }
  });

});

//no next so request gets absorbed here
router.get('/restaurantsAvail', function(req, res){

    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
  
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/mainsite';
  
    // Connect to the server
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {
        // We are connected
        console.log('Connection established to', url);
    
        // Get the documents collection
        var collection = db.collection('restaurants');
        //console.log(req.query);
        //console.log(JSON.parse(req.query.props));
        //console.log(req.query.props.cats);
        //console.log(req.query.props["cats"]);
        var cuisines= JSON.parse(req.query.props).cats;
        var areas= JSON.parse(req.query.props).areas;
        var outdoor= JSON.parse(req.query.props).outdoor;
        var price= JSON.parse(req.query.props).price;
        var rating= JSON.parse(req.query.props).rating;

        var queryComplete={};
        if(areas.length>0) queryComplete.area={ '$in':  areas};
        if(cuisines.length>0 ) queryComplete.cuisine=  { "$elemMatch": { "$in": cuisines } };
        if(outdoor) queryComplete["outdoor seating"]= "yes";
        
        var matchComplete={};
        var priceMatch={};
        console.log("The price length is", price.length);
        
        priceMatch["$match"]= { $or:[{ "priceL": {"$lte": price.length}},{"priceL": 0}  ]};
        
        
        
        matchComplete["$match"]={$or:[{"avgRating":{"$gte": rating}},{"avgRating":null}]};
        //queryComplete.rating= {$gt: rating-1};


        console.log("the areas are", areas);
        console.log("the cats are", cuisines);
        console.log(queryComplete);
        // Find all restaurants , {name:1,address:1 }

        
        //working queries
        //.find({area:{"$in":["covent garden"]}})

        //collection.find( queryComplete )
        console.log("THE MATCH COMPLETE THING",matchComplete);
        collection.aggregate(
          [
            {$match:queryComplete},
            {$addFields:{price:{$ifNull:["$price", ""]}}},
            {$addFields:{ avgRating: {$avg: "$ratings"}, priceL: {$strLenCP:"$price"}}},
            matchComplete,
            priceMatch
          ]
            /*
            $project:{
              ratings:1,
              avgRating: {$avg: "$ratings"}
            },*/
           // $match: {$where : this.avgRating >= rating}
          
          ).toArray( function (err, result) {
          if (err) {
            res.send(err);
          } else if (result.length) {
            //return result
            console.log("Recieved result");
            res.json(result);
          } else {
            console.log("result.length", result.length);
            res.send('No documents found');
          }
          //Close connection
          db.close();
        });
      }
  });
});


//Get data /:areaOptions
router.get('/:areaOptions',function(req,res,next){
  //req.params.id
  //findById
  
  console.log("get", req.params.id);
  next();
});

//Get distinct options for any dropdown menu
  router.get('/:options', function(req, res){
  
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
  
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/mainsite';
  
    // Connect to the server
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the Server', err);
      } else {
        // We are connected
        console.log('Connection established to', url);
    
        // Get the documents collection
        var collection = db.collection('restaurants');
    
        // Find all students
        collection.distinct(req.params.options, function (err, result) {
          if (err) {
            res.send(err);
          } else if (result.length) {
            //return result
            res.send(result);
          } else {
            console.log("result.length", result.length);
            res.send('No documents found');
          }
          //Close connection
          db.close();
        });
      }
  });
});

//render index.jade, with title express
//located in views database
router.get('/', function(req, res, next) {

  // Get a Mongo client to work with the Mongo server
  var MongoClient = mongodb.MongoClient;
 
  // Define where the MongoDB server is
  var url = 'mongodb://localhost:27017/mainsite';
  
  // Connect to the server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      // We are connected
      console.log('Connection established to', url);
  
      // Get the documents collection
      var collection = db.collection('restaurants');
  
      // Find all students
      collection.find({}).toArray(function (err, result) {
        if (err) {
          res.send(err);
        } else if (result.length) {
          //render new jade view called studentlist
          res.render('layout',{
  
            // Pass the returned database documents to Jade
            "restaurantlist" : result
          });
        } else {
          console.log("result.length", result.length);
          res.send('No documents found');
        }
        //Close connection
        db.close();

      });
    }
  });
});
  



module.exports = router;
