'use strict'
var express = require('express');
var api = express.Router(); // cargamos router de express para tener acceso alos metodos get, post, put, etc
var middleWare_authentication = require('../middlewares/authenticated'); // objeto edl middleware 
var MessageController = require('../controllers/message');

api.get('/prueba-message',middleWare_authentication.ensureAuth,MessageController.pruebaMessage);
api.post('/message', middleWare_authentication.ensureAuth, MessageController.saveMessage);
api.get('/messages-receiver/:page?', middleWare_authentication.ensureAuth, MessageController.getListMessageReciev);
api.get('/messages-send/:page?', middleWare_authentication.ensureAuth, MessageController.getListMessageSend);
api.get('/messages-unviewed', middleWare_authentication.ensureAuth, MessageController.getUnviewed);
api.get('/set-messages-viewed', middleWare_authentication.ensureAuth, MessageController.updateViewMessage);




module.exports = api;