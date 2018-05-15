'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'claveSecretaTalitacumMiradord18FacundoConil33';  //clave secreta que solo el programador conoce para encriptar el token
exports.ensureAuth = function (req, res, next) {  //next es la funcionalidad que permite saltar a otra cosa, si no ejecutamos el metodo next el programa no va a salir del middleware, cuando lo ejcutamos el programa salta a lo siguiente que este en ejecucion 
    if (!req.headers.authorization) {   // el token nos va a llegar en una cabecera (headers) que se llama authorization 
        return res.status(403).send({
            message: "la peticion no tiene la cabecera de autenticacion "
        });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, ''); //variable token que contiene e valor de authorization y replace es para quitar las comillas simples y dobles y el +/g es para que sea en cualquier parte del string y las comillas simples es para decirles que las remplace por nada ''
        try {
            var payload = jwt.decode(token, secret); //decodificar el payload es el objeto con todos los datos que tiene el token
            if (payload.exp <= moment().unix()) {  // Si el token lleva una fecha que es menor a la fecha de ahora moment
                return res.status(401).send({
                    message: 'El token a expirado '
                });
            }
        } catch (ex) {   //si se captura una excepcion 
            return res.status(404).send({
                message: 'El token no es valido'
            });
        }
    }
    //adjutar el payload a la request para tener siempre dentro ed los controladores el objeto del usuario logeado
    req.user = payload;   // de esta manera en los controladores yo tengo acceso a req.user y dentro tengo todos los datos del usuario que esta enviando el token, el usuario que esta identificado mediante ese token, tengo todos sus datos dentro de esta propieda user del objeto req

    next();  //salida, salta a lo proximo que tenga que ejecutar nodejs
}