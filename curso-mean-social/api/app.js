'use strict'
var express = require('express'); //cargar libreria de express 'express' es el modulo en package.json
var bodyParser = require('body-parser');//cargar libreria de body-parser (leer txt) 'body-parser' es el modulo en package.json
var app = express(); //cargar express

//cargar rutas
var user_routes = require('./routes/user'); //carga la ruta de usuario
var follow_routes = require('./routes/follow'); //carga la ruta de follow
var publication_routes = require('./routes/publications'); //carga la ruta de publicaciones
var message_routes = require('./routes/message'); //carga la ruta de message

//cargar middlewares (middleware es un metodo que se ejecuta antes de que llegue a un controlador , en cada peticion se va a ejecutar este middleware )
app.use(bodyParser.urlencoded({ extended: false })); //CONFIGURACION DE BODY-PARSER
app.use(bodyParser.json());//CONVIERTE LO QUE LLEGUE EN EL BODY A UN OBJETO JSON


//cors
// configurar cabeceras http
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

	next();
});
//rutas
//Se define una ruta /api y user_routes (cualquiera de las rutas que esten en las rutas de usuario en routes/user.js) osea que esto se va a ejecutar en http://localhost:3800/api/las rutas que tengamos declaradas 

app.use('/api', user_routes); // El app.use() nos permite hacer middleware es decir que encada peticion que se haga el middleware se ejecuta antes de llegar a la accion del controlador
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

/*app.get('/', (req, res) => {        //get(metodo http de express), esto recibe una funcion con dos parametros(req(request,es lo que nos llega) y res(la respuesta)) se visualiza en localhost
    res.status(200).send({ //res(respuesta) con codigo (200) y devuelve (send) un json { message }
        message: 'Accion de home en el servidor de nodejs'
    });

});

app.get('/pruebas', (req, res) => {        //get(metodo http de express), esto recibe una funcion con dos parametros(req(request,es lo que nos llega) y res(la respuesta)) se visualiza en localhost/pruebas
    res.status(200).send({ //res(respuesta) con codigo (200) y devuelve (send) un json { message }
        message: 'Accion de pruebas en el servidor de nodejs'
    });

});
*/
//exportar
module.exports = app;