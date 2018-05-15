'use strict'  //permite utilizar nuevas caractericticas de javascript
var app = require('./app'); // variable app con la config de express en esta variable esta express
var port = 3800;
var mongoose = require('mongoose'); //cargar libreria de mongoose 'mongoose' es el modulo en package.json

//conectar a nuestra DB de mongoDB
mongoose.Promise = global.Promise; //promesas, LEER EL TXT
mongoose.connect('mongodb://localhost:27017/curso_mean_social', { useMongoClient: true }) 
    .then(() => {        //si la conexion se realiza correctamente, se lanza la funcion
        console.log("la conexion a la db se ha realizado correctamente");

//crear servidor
app.listen(port,() =>{
    console.log("servidor corriendo en http://localhost:3800");
});

    })
    .catch(err => console.log(err));