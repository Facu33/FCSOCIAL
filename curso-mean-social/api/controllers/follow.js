'use strict'

var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');//Cargamos el modelo de usuario
var Follow = require('../models/follow');//Cargamos el modelo de follow

//Metodo que permite un usuario seguir a otro
function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub; //Guardo el id del usuario indentificado
    follow.followed = params.followed; //

    follow.save((err, followStored) => {
        if (err) {
            return res.status(500).send({
                message: 'error al guardar el seguimiento'
            });
        }

        if (!followStored) {
            return res.status(404).send({
                message: 'El seguimiento no se ha guardado'
            });
        }
        return res.status(200).send({
            follow: followStored
        });
    });
}

//Metodo para dejar de seguir

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({ 'user': userId, 'followed': followId }).remove(err => {
        if (err) return res.status(500).send({
            message: 'error al dejar de seguir'
        });
        return res.status(200).send({
            message: 'Has dejado de seguir'
        });
    });
}

//metodo para obtener un listado de usuarios que sigo 
function getFollows(req, res) {
    var userId = req.user.sub; //En esta variable recojemos el id del usuario que este logeado en este momento, en la autorizacion hicimos una propiedad user a la req con el middleware entonces ahi tenemos un objeto completo del usuario el cual nos esta mandando el token , el objeto del usuario que se ha decodificado del token , la propiedad 'sub' es el la propiedad declarada en el payload del token y contiene el id
    var page = 1; //siempre es 1, 

    if (req.params.id && req.params.page) {   //En caso de que nos llegue le id por la url entonces en la variable userId guardamos ese usuario que noe llego por la url
        userId = req.params.id;
    }
    if (req.params.page) { // Comprobar que nos llega la pagina por la url , page es la pagina que nosotros estamos recogiendo 
        page = req.params.page; // si existe el parametro page que nos llegapor la url entonces actualizamos su valor
    } else {
        page = req.params.id;
    }
    var itemsPorPage = 5; //cantidad de elementos(usuarios seguidos) que se mostraran por pagina 
    Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPorPage, (err, follows, total) => {  //Find busca todos los objetos en los que salga el id de user osea el id del usuario que queremos saber los seguidores, Metodo populate popula los resultados, nuestro resultado va a ser un objeto follow que tiene un user un followed y un id, nosotros le decimos que popule a followed entonces en vez de traerme el id de ese seguidor me trae el objeto completo
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!follows) return res.status(404).send({
            message: 'no hay follows disponibles o no estas siguiendo a ningun usuario'
        });

        return res.status(200).send({
            follows,
            total,
            pages: Math.ceil(total / itemsPorPage)  //numero de paginas totales que hay, math.ceil es para redondear el resultado de una division, y para sacar el total de paginas se divide el total, por itemsPorPagina 
        });

    });
}

//Metodo para saber cuantos usuarios siguen a otro usuario

function getFollowed(req, res) {
    var userId = req.user.sub; //En esta variable recojemos el id del usuario que este logeado en este momento, en la autorizacion hicimos una propiedad user a la req con el middleware entonces ahi tenemos un objeto completo del usuario el cual nos esta mandando el token , el objeto del usuario que se ha decodificado del token , la propiedad 'sub' es el la propiedad declarada en el payload del token y contiene el id
    var page = 1; //siempre es 1, 

    if (req.params.id && req.params.page) {   //En caso de que nos llegue le id por la url entonces en la variable userId guardamos ese usuario que noe llego por la url
        userId = req.params.id;
    }
    if (req.params.page) { // Comprobar que nos llega la pagina por la url , page es la pagina que nosotros estamos recogiendo 
        page = req.params.page; // si existe el parametro page que nos llega por la url entonces actualizamos su valor
    } else {
        page = req.params.id;
    }
    var itemsPorPage = 5; //cantidad de elementos(usuarios seguidos) que se mostraran por pagina 

    Follow.find({ followed: userId }).populate('user followed').paginate(page, itemsPorPage, (err, follows, total) => {  //Find busca todos los objetos en los que salga el id de user osea el id del usuario que queremos saber los seguidores, Metodo populate popula los resultados, nuestro resultado va a ser un objeto follow que tiene un user un followed y un id, nosotros le decimos que popule a followed entonces en vez de traerme el id de ese seguidor me trae el objeto completo
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!follows) return res.status(404).send({
            message: 'No hay follows disponibles o no te sigue ningun usuario'
        });

        return res.status(200).send({
            follows,
            total,
            pages: Math.ceil(total / itemsPorPage)  //numero de paginas totales que hay, math.ceil es para redondear el resultado de una division, y para sacar el total de paginas se divide el total, por itemsPorPagina 
        });

    });
}

//Metodo para devolver lista de usuarios que sigo y me siguen sin paginar

function getMyFollows(req, res) {
    var userId = req.user.sub; //En esta variable recojemos el id del usuario que este logeado en este momento, en la autorizacion hicimos una propiedad user a la req con el middleware entonces ahi tenemos un objeto completo del usuario el cual nos esta mandando el token , el objeto del usuario que se ha decodificado del token , la propiedad 'sub' es el la propiedad declarada en el payload del token y contiene el id
    var find = Follow.find({ user: userId });  // Busco usuarios que yo sigo
    if (req.params.followed) {   // Si recibo el parametro fllowed entonces me busca los usuarios que me siguen 
        find = Follow.find({ followed: userId });
    }
    find.populate('user followed').exec((err, follows) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!follows) return res.status(404).send({
            message: 'No hay follows disponibles o no sigues a ningun usuario'
        });

        return res.status(200).send({
            follows
        });
    });
}
module.exports = {
    saveFollow,
    deleteFollow,
    getFollows,
    getFollowed,
    getMyFollows
}