
'use strict'
//cargar express
var express = require('express');
var UserControler = require('../controllers/user'); //cargamos el controlador
var api = express.Router(); // cargamos router de express para tener acceso alos metodos get, post, put, etc
var middleWare_authentication = require('../middlewares/authenticated'); // objeto edl middleware 
 var middleware_multiparty = require('connect-multiparty'); // cargar md multiparty Este middleware creará archivos temporales en su servidor y nunca los limpiará. Por lo tanto, no debe agregar este middleware a todas las rutas; solo a aquellos en los que deseas aceptar cargas. Y en estos puntos finales, asegúrese de eliminar todos los archivos temporales, incluso los que no usa.
var middleware_upload = middleware_multiparty({uploadDir : './uploads/users'});
//Definir rutas

api.get('/home', UserControler.home); //get(metodo http de express),llamamos al metodo creado en controller y esto se visualiza en localhost/home
api.get('/pruebas',middleWare_authentication.ensureAuth, UserControler.pruebas); //get(metodo http de express),llamamos al metodo creado en controller y esto se visualiza en localhost/pruebas , el segundo paramento es el middleware, lo que va a hacer es va a comprobar si el token es correcto si es correcto (al estar pidiendo autenticacion) va a psar al siguiente parametro, en este caso el metodo pruebas, si no es correcto me devuelve que el token no es valido
api.post('/register',UserControler.saveNewUser); //post http://lineadecodigo.com/nodejs/parametros-post-con-nodejs-y-express/ 
api.post('/login',UserControler.loginNewUser); //post http://lineadecodigo.com/nodejs/parametros-post-con-nodejs-y-express/ 
api.get('/user/:id',middleWare_authentication.ensureAuth,UserControler.getDataUser); //para pasar el id por la url es /:id y para hacerlo opcional se le agrega '?' 
api.get('/users/:page?',middleWare_authentication.ensureAuth,UserControler.getUsers);
api.put('/update-user/:id',middleWare_authentication.ensureAuth,UserControler.updateUser);   //metodo put es para actualizar 
api.post('/upload-image-user/:id',[middleWare_authentication.ensureAuth,middleware_upload],UserControler.uploadImage);
api.get('/get-image-user/:imageFile',UserControler.getImageFile); //imagFile es el parametro que recibe porla url
api.get('/count/:id?',middleWare_authentication.ensureAuth,UserControler.getCounter);
module.exports = api;