'use strict'
 var jwt = require('jwt-simple'); // cargamos jwt
 var moment= require('moment');  // cargamos moment libreria para fechas 
 var secret = 'claveSecretaTalitacumMiradord18FacundoConil33';  //clave secreta que solo el programador conoce para encriptar el token
 exports.createToken = function(user){
 // payload va a contener un objeto con los datos del usuario que yo quiero codificar dentro de mi token
 //con estepayload se genera el token
    var payload = {  
    sub : user._id, //propiedad sub dentro ed jwt se indentifica como el id  
    name:user.name,
    surname: user.surname,
    nick:user.nick,
    email: user.email,
    role:user.role,
    image:user.image,
    iat: moment().unix(), //iat dentro de jwt es la fecha de creacion del token,aqui se guarda la fecha donde se creo el token
    exp:moment().add(30,'days').unix  //exp dentro de jwt es la fecha de expiacion se le suman 30 dias 
 }  
 return jwt.encode(payload,secret); //encode libreria de jwt para generar el token, le pasamos el payLoad donde estan los datos del usuario y la variable secret que es un string secreto que solo el programador conoce para cifrar el token
 
};