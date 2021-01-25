var express = require('express');
var router = express.Router();
var swig = require('swig');

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://luisolivaabel:LuisOlivaAbel2021@cluster0.jrtwl.mongodb.net/proyectoClase?retryWrites=true&w=majority";

function Usuario (usuario, password){
  this.usuario= usuario;
  this.password = password;
}

router.get('/', function (req, res) {
  var home = swig.renderFile('views/index.html');
  res.send(home);
});

router.post('/registro', function (req, res) {
  //Capturamos petición POST para el registro del usuario
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");

    var usuario = new Usuario (req.body.usuario, req.body.password);

    var query = { usuario: req.body.usuario };

    //Consultamos si existe el usuario en BBDD
    dbo.collection("usuarios").find(query).toArray(function(err, result) {
      if (err) throw err;
      if (result.length > 0) {
        var usuarioYaRegistrado = swig.renderFile('views/accesoIncorrecto.html',{
          usuario: req.body.usuario,
          titulo: "El usuario ya existe en la BBDD, por favor, utilice su contraseña para entrar",
          tituloBoton: "Acceder",
          urlFormulario: "/acceso"
        });
        res.send(usuarioYaRegistrado);
      } else {
        //Como no existe, creamos el usuario en BBDD
        dbo.collection("usuarios").insertOne(usuario, function (err, result) {
          if (err) {
            var registroKO = swig.renderFile('views/accesoIncorrecto.html', {
              usuario: req.body.usuario,
              titulo: "Ha ocurrido un error en la BBDD creando el usuario",
              error: err
            });
            res.send(registroKO);
          } else {
            res.redirect('/listadoPeliculas');
          }
        });
      }
      db.close();
    });
  });
});

router.post('/acceso', function (req, res) {
  //Capturamos petición POST para probar acceso del usuario
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("proyectoClase");

    var query = { usuario: req.body.usuario };
    dbo.collection("usuarios").find(query).toArray(function(err, resultado) {
      if (err) throw err;

      if (resultado.length === 0){
        //Como el usuario no existe, obligamos a registrarse
        var accesoKO = swig.renderFile('views/accesoIncorrecto.html',{
          usuario: req.body.usuario,
          titulo: "El usuario no existe, por favor, regístrese.",
          tituloBoton: "Registrar",
          urlFormulario: "/registro"
        });
        res.send(accesoKO);
      } else{
        //Como existe, vamos a la página de listado de películas
        if (req.body.password === resultado[0].password){
          res.redirect('/listadoPeliculas')
        } else{
          //Como la contraseña no coincide, le obligamos a introducirla de nuevo
          var accesoKO = swig.renderFile('views/accesoIncorrecto.html',{
            usuario: req.body.usuario,
            titulo: "La contraseña no coincide.",
            tituloBoton: "Acceder",
            urlFormulario: "/acceso"
          });
          res.send(accesoKO);
        }
        db.close();
      }
    });
  });
});

module.exports = router;