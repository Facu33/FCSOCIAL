'use strict'
var express = require('express');
var followControler = require('../controllers/follow'); // cargamos controlador de follow
var api = express.Router(); // cargamos router de express para tener acceso alos metodos get, post, put, etc
var middleWare_authentication = require('../middlewares/authenticated'); // objeto edl middleware 
api.post('/follow', middleWare_authentication.ensureAuth, followControler.saveFollow);
api.delete('/unFollow/:id',middleWare_authentication.ensureAuth,followControler.deleteFollow);
api.get('/following/:id?/:page?',middleWare_authentication.ensureAuth,followControler.getFollows);
api.get('/followed/:id?/:page?',middleWare_authentication.ensureAuth,followControler.getFollowed)
api.get('/getMyFollows/:followed?',middleWare_authentication.ensureAuth,followControler.getMyFollows);

module.exports = api;
