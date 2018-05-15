'use strict'
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');//Cargamos el modelo de usuario
var Publication = require('../models/publication');
var Follow = require('../models/follow');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs'); //libreria de nodejs filesistem que nos permite trabajar con archivos
var path = require('path'); //libreria de nodejs path que nos permite trabajar con rutas de sistemas de ficheros


function pruebaPubli(req, res) {
    return res.status(200).send({
        message: 'Accion de pruebas en publicacion'
    });
}
//Guardar una nueva publicacion

function saveNewPublication(req, res) {
    var publication = new Publication();
    var params = req.body;
    if (params.text || params.file) {
        publication.text = params.tex
        publication.file = null;
        publication.user = req.user.sub;
        publication.created_at = moment().unix(); //Fecha de creacion de la publicacion

        publication.save((err, publicationStored) => {     //Guardar en mogodb
            if (err) return res.status(500).send({
                message: "Error al guardar la publicacion"
            });

            if (publicationStored) {
                res.status(200).send({
                    publication: publicationStored      //Esto es un json que tiene una propiedad user que tiene el objeto completo del usuario almacenado
                });
            } else {
                res.status(404).send({
                    message: "No se ha guardado la publicacion"
                });
            }

        });
    } else {
        return res.status(404).send({
            message: 'envia los campos requeridos'
        });
    }

}

//Metodo para listar la publicaciones paginadas de usuarios que sigo

function getPublications(req, res) {
    var page = 1;
    var itemsPerPage = 4;
    if (req.params.page) {
        page = req.params.page;
    }
    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({
            message: 'Error al devolver usuarios que sigo'
        });
        var arrayIdsUser = [];
        follows.forEach((follow) => {
            arrayIdsUser.push(follow.followed);
        });
        console.log(arrayIdsUser);

        //Buscar las publicacions de estos usuarios

        Publication.find({ user: { "$in": arrayIdsUser } }).sort('created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => { //$in busca dentro de un array si hay un usuario que coincide con una publicacion entonces lo trae
            if (err) return res.status(500).send({
                message: 'Error al devolver publicaciones'
            });
            if (!publications) return res.status(404).send({
                message: 'No hay publicaiones'
            });

            return res.status(200).send({
                total,
                pages: Math.ceil(total / itemsPerPage),
                page,
                itemsPerPage,
                publications
            });

        });
    });

}

//Conseguir una publicacion en base a su ID

function getPublicationById(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) return status(500).send({
            message: 'error en la peticion'
        });
        if (!publication) {
            return res.status(404).send({
                message: 'No existe la publicacion'
            });
        }
        return res.status(200).send({
            publication
        });
    })

}

//Eliminar una publicacion 

function deletePublication(req, res) {
    var userId = req.user.sub;
    var publicationId = req.params.id;

    Publication.find({ "user": userId, "_id": publicationId }).remove(err => {
        if (err) return status(500).send({
            message: 'Error en la peticion'
        });

        return res.status(200).send({
            message: 'Publicacion eliminada correctamente '
        });
    });
}

//Subir ficheros a las publicaciones 

function uploadFilePublication(req, res) {
    var userId = req.user.sub; //En esta variable recojemos el id del usuario que este logeado en este momento
    var publicationId = req.params.id;

    if (req.files.file) {  //si existe files , es decir si estamos enviando algun fichero podremos subir el fichero en si y guardarlo e la db
        var file_path = req.files.file.path;  // sacamos el path completo de la imagen que queremos subir, image es el campo que estamos enviando por post y de ahi sacamos el campo path
        var files_split = file_path.split('\\');  //en la variable file_path se guarda un string con la ruta del archivo y esta separada por '\' ej uploads\users\5MdupNps5rOyV8s8Ln5DvR90.png con la funcion split y declarandole las '\' le decimos que corte las barras y al final queda algo como esto  [ 'uploads', 'users', 'QMPHzXA0IJhALKIwXGBiL8l5.png' ]
        console.log(files_split);
        var fileName = files_split[2]; //en files split esta guardado un array [ 'uploads', 'users', 'QMPHzXA0IJhALKIwXGBiL8l5.png' ] e la variable fileName guardamos el indice 2, donde esta el nombre del fichero
        var ext_split = fileName.split('\.'); // cortamos por el punto
        var fileExt = ext_split[1]; // guardamos la extencion del fichero, ej : png
        console.log(fileExt);
        //comparar si el userId que estoy recibiendo por la url es diferente al user id que yo tengo en la request, porque este metodo para actualizar datos lo vamos a usar cuando el propio usuario que se a creado su cuenta pueda modificarse sus propios datos
        if (userId != req.user.sub) {
            return removeFileOfUpload(res, file_path, 'No tiene permiso para actualizar los datos');//si el usuario que nos llega por url no es igual al is del usuario que tenemos en la request

        }
        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'mp4' || fileExt == 'avi') {  //Si la extension del archivo que intentan subir es valido, entonces vamos a actualizar el objeto en la base de datos
            Publication.findOne({ "user": userId, "_id": publicationId }).exec((err, publication) => {   //Fin devuelve un array por lo tanto no toma como que es un token incorrecto, pero haciendo findOne si el usuario no tiene permisos trae null y ahi si lo toma como incorrecto
                if (publication) {
                    //actualizar documento del usuario logeado
                    Publication.findByIdAndUpdate(publicationId, { file: fileName }, { new: true }, (err, publicationUpdate) => {
                        if (err) return res.status(500).send({
                            message: 'Error en la la peticion'
                        });

                        if (err) return res.status(404).send({
                            message: 'No se ha podido actualizar el usuario'
                        });
                        return res.status(200).send({
                            publication: publicationUpdate
                        });
                    });
                } else {
                    return removeFileOfUpload(res, file_path, 'No tienes permisos');
                }

            });

        } else {
            //Eliminar fichero          
            return removeFileOfUpload(res, file_path, 'Extension no valida');
        }
    } else {
        return res.status(200).send({
            message: 'no se han subido archivos'
        });
    }
}
function removeFileOfUpload(res, file_path, message) {  //Eliminar un fichero 
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message: message
        });
    });
}

module.exports = {
    pruebaPubli,
    saveNewPublication,
    getPublications,
    getPublicationById,
    deletePublication,
    uploadFilePublication
}