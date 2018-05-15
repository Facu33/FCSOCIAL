'use strict'
var express = require('express');
var api = express.Router(); // cargamos router de express para tener acceso alos metodos get, post, put, etc
var middleWare_authentication = require('../middlewares/authenticated'); // objeto edl middleware 
var PublicationsController = require('../controllers/publications');
var middleware_multiparty = require('connect-multiparty'); // cargar md multiparty Este middleware creará archivos temporales en su servidor y nunca los limpiará. Por lo tanto, no debe agregar este middleware a todas las rutas; solo a aquellos en los que deseas aceptar cargas. Y en estos puntos finales, asegúrese de eliminar todos los archivos temporales, incluso los que no usa.
var middleware_upload = middleware_multiparty({uploadDir : './uploads/users'});
api.post('/publication',middleWare_authentication.ensureAuth,PublicationsController.saveNewPublication);
api.get('/get-publications/:page?',middleWare_authentication.ensureAuth,PublicationsController.getPublications);
api.get('/get-publication-id/:id',middleWare_authentication.ensureAuth,PublicationsController.getPublicationById);
api.delete('/delete-publication/:id',middleWare_authentication.ensureAuth,PublicationsController.deletePublication);
api.post('/upload-file-publication/:id',[middleWare_authentication.ensureAuth,middleware_upload],PublicationsController.uploadFilePublication);

module.exports = api;
