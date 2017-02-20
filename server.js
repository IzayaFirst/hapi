const Hapi = require('hapi');
const mysql = require('promise-mysql')
var connection ;

mysql.createConnection({
    host: 'localhost',
    user: 'first',
    password: '@point128',
    database: 'senior_project'
}).then(function(conn){
    connection = conn;
});
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000 ,
    routes: {
            cors: true
        }
});


server.route({
  method: 'GET' ,
  path : '/',
  handler : function(request , reply){

     reply('Hello world')
  }
})
server.route({
  method: 'GET' ,
  path : '/api/activities/province/{pv}',
  handler : function(request, reply){
      var pv = encodeURIComponent(request.params.pv)
      connection.query('select * from tbl_activity where province = ?' , [pv])
      .then(function(rows){
          reply(rows)
      }).catch(function(err){
          reply(err)
      })
  }
})

server.route({
  method: 'GET' ,
  path: '/api/activities/detail/{name}' ,
  handler: function(req , res){
        var id = req.params.name
        console.log(id)
        connection.query("select * from tbl_activity  where activity_name = ?  "
        , [id]
      ).then(function(results){
        res(results)
      }).catch(function(err){
          res(err)
      })
  }
})



server.route({
  method: 'GET' ,
  path: '/api/activities/popular' ,
  handler: function(req , res){
        connection.query("select * from tbl_activity limit 6"
      ).then(function(results){
        res(results)
      }).catch(function(err){
          res(err)
      })
  }
})

server.route({
  method: 'GET' ,
  path: '/api/activities/price/id/{aid}' ,
  handler: function(req , res){
        var id = encodeURIComponent(req.params.aid)
        connection.query("select * from tbl_price where activity_id = ?" , [id]
      ).then(function(results){
        res(results)
      }).catch(function(err){
          res(err)
      })
  }
})



server.route({
  method: 'POST',
  path: '/api/activities',
  handler: function(req , res){
      //var payload = req.payload

        var name = req.payload.name
        var desc = req.payload.desc
        var cover = req.payload.cover
        var province = req.payload.province
        var location = req.payload.location
        var type = req.payload.type
        var status = "opened"
        var price = req.payload.price

        //console.log(priceArr)
        connection.query("insert into tbl_activity(activity_name , activity_desc, cover_photo ,province , location,type , status) values(?,?,? , ? , ? , ? , ?)",
         [name , desc , cover ,province , location , type , status] ).then(function(result){
        //  console.log(result.insertId)
        var priceArr = [];
        for(var i = 0 ; i < price.length ; i++){
          x = [result.insertId ,price[i].price , price[i].amount]
          priceArr.push(x)
        }
        return connection.query('insert into tbl_price(activity_id , price , amount) value ?' , [priceArr])
      }).then(function(result){
          res({
            "status" : "successful create activity"
          }).code(201)
      }).catch(function(err){
          res(err)
        })
  }
})




server.start((err) => {
  if(err){
    throw(err)
  }
  console.log("Running API SERVER on port 8000")
});
