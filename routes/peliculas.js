var express = require('express');
var router = express.Router();
var swig = require('swig');

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://luisolivaabel:LuisOlivaAbel2021@cluster0.jrtwl.mongodb.net/proyectoClase?retryWrites=true&w=majority";

function Pelicula (nombre, director, anyo, precio){
  this.nombre= nombre;
  this.director = director;
  this.anyo = anyo;
  this.precio = precio;
}

router.get('/', function(req, res, next) {
  //Capturamos petición GET en raíz para obtener el listado de películas
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");
    dbo.collection("peliculas").find({}).toArray(function(err, resultado) {
      if (err) throw err;
      if (resultado.length === 0){
        var peliculas = swig.renderFile('views/listadoPeliculas.html');
      } else{
        var peliculas = swig.renderFile('views/listadoPeliculas.html',{
          listado: resultado
        });
      }
      res.send(peliculas);
      db.close();
    });
  });
});

router.get('/pelicula/:id', function(req, res, next) {
  //Capturamos petición GET con ID para obtener información de una película
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");

    var id = require('mongodb').ObjectID(req.params.id);

    dbo.collection("peliculas").find({  _id : id  }).toArray(function(err, resultado) {
      if (err) throw err;
      var pelicula = swig.renderFile('views/modificarPelicula.html',{
        pelicula: resultado
      });
      res.send(pelicula);
      db.close();
    });
  });
});

router.post('/pelicula', function(req, res) {
  //Capturamos petición POST con sin ID para insertar una película
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var pelicula = new Pelicula (req.body.nombre, req.body.director, req.body.anyo, req.body.precio);
    var dbo = db.db("proyectoClase");
    dbo.collection("peliculas").insertOne(pelicula, function(err, resultado) {
      if (err) {
        res.send("Error insertando película");
      } else {
        res.redirect('/listadoPeliculas');
      }
      db.close();
    });
  });
});

router.post('/pelicula/:id', function(req, res) {
  //Capturamos petición POST con ID para modificar una película
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");

    var id = require('mongodb').ObjectID(req.params.id);
    var pelicula = new Pelicula (req.body.nombre, req.body.director, req.body.anyo, req.body.precio);
    dbo.collection("peliculas").updateOne({  _id : id  }, { $set: pelicula }, function(err, resultado) {
      if (err) throw err;
      res.redirect('/listadoPeliculas');
      db.close();
    });
  });
});

router.delete('/pelicula/:id', function(req, res) {
  //Capturamos petición DELETE para borrar una película
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");
    var id = require('mongodb').ObjectID(req.params.id);
    dbo.collection("peliculas").deleteOne({  _id : id  }, function(err, resultado) {
      if (err) throw err;
      //res.send('Ha sido borrado');
      res.sendStatus(200);
      db.close();
    });
  });
});

module.exports = router;