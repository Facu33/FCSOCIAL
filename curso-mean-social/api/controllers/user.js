'use strict'
var User = require('../models/user'); // cargamos modelo de usuario User va con mayuscula para resaltar que es un modelo
var Follow = require('../models/follow');
var bcrypt = require('bcrypt-nodejs');  // importamos el modulo bcrypt para cifrar contraseñas
var mongoosePaginate = require('mongoose-pagination'); //cargar mongoose-pagination
var jwt = require('../services/jwt'); // importamos el token creado
var fs = require('fs'); //libreria de nodejs filesistem que nos permite trabajar con archivos
var path = require('path'); //libreria de nodejs path que nos permite trabajar con rutas de sistemas de ficheros
var Publication = require('../models/publication');
//Metodos de prueba

function home(req, res) {      // Funcion es un metodo de nuestro controlador va a hacer una accion de nuestra API   
    res.status(200).send({ //res(respuesta) con codigo (200) y devuelve (send) un json { message }
        message: 'Accion de pruebas en el servidor de nodejs'
    });

}
function pruebas(req, res) {       // Funcion es un metodo de nuestro controlador va a hacer una accion de nuestra API   
    res.status(200).send({ //res(respuesta) con codigo (200) y devuelve (send) un json { message }
        message: 'Accion de pruebas en el servidor de nodejs'
    });

}


// Metodo para guardar un usuario

function saveNewUser(req, res) {  //funcion para guardar un nuevo usuario
    var params = req.body; // en la variable params se reconjen los paramentros de la request, todo los campos que lleguen por post se guarda en esta variable
    var user = new User(); // Objeto del modelo user


    if (params.name && params.surname && params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;


        //controlar usuarios duplicados
        // El predicado $or en el json es la condicion "o" 
        User.find({
            $or: [
                { email: user.email.toLowerCase() },  //toLowerCase es para trasformar el string a minuscula
                { nick: user.nick.toLowerCase() }

            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({
                message: "Error en la peticion de usurario"
            });
            if (users && users.length >= 1) {
                return res.status(200).send({
                    message: "El email o nombre de usuario ya existen"
                });
            } else {
                // cifra la password y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) => { //cifrar contraseña
                    user.password = hash;

                    user.save((err, userStored) => {     //Guardar en mogodb
                        if (err) return res.status(500).send({
                            message: "Error al guardar el usuario"
                        });

                        if (userStored) {
                            res.status(200).send({
                                user: userStored      //Esto es un json que tiene una propiedad user que tiene el objeto completo del usuario almacenado
                            });
                        } else {
                            res.status(404).send({
                                message: "No se ha registrado el usuario"
                            });
                        }

                    });
                });
            }
        });
    } else {
        res.status(200).send({
            message: "Envia todos los campos"
        });
    }
}

//Metodo de Login de un usuario

function loginNewUser(req, res) {

    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {   //esto es un and "y"


        if (err) return res.status(500).send({
            message: "Error en la peticion de login"
        });
        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    if (params.gettoken) {
                        //generar y devolver token
                        return res.status(200).send({         //llamamos al metodo createToken y lepasamos el usuario que intentamos logear
                            token: jwt.createToken(user)
                        });
                    } else {
                        //devolver datos de usuario
                        user.password = undefined;  // Cuando nos devuelve el objeto json , la propiedad de password no la devuelve
                        return res.status(200).send({
                            user
                        });
                    }

                } else {
                    return res.status(404).send({
                        message: "El usuario no se ha podido logear"
                    });
                }
            })   //libreria de bcrypt que compara si el password que le estoy pasando es igual al password del usuario guardado en la db

        } else {
            return res.status(404).send({
                message: "El usuario no se ha podido logear!!!!!!!"
            });
        }
    });
}

// Metodo para conseguir datos de un usuario

function getDataUser(req, res) {
    var userId = req.params.id;//recoger id del usuario, nos va a llegar por la url, cuando nos llegan datos por la url (get) utilizamos params cuando llegan por post o put utilizamos body
    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion '
        });
        if (!user) return res.status(404).send({
            message: 'El usuario no existe'
        });
        followThisUser(req.user.sub, userId).then((value) => {  //llamo a la funcion asincronica followThisUser que me devuelve los datos de seguidores y seguidos de un usuario
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });

    });
}

async function followThisUser(indentityUserId, userId) {
    try {
        var following = await Follow.findOne({ "user": indentityUserId, "followed": userId }).exec()  //De esta manera indentificamos si nosotros el usuario identificado(userIdentify) estamos siguiendo al usuario que nos llega por la url (userId)
            .then((following) => {
                return following;
            })
            .catch((err) => {
                return handleError(err);
            });


        var followed = await Follow.findOne({ "user": userId, "followed": indentityUserId }).exec()  //De esta manera indentificamos si nosotros el usuario identificado(userIdentify) estamos siguiendo al usuario que nos llega por la url (userId)
            .then((followed) => {
                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });

        return {
            following: following,
            followed: followed
        }
    } catch (e) {
        console.log(e);
    }
}


//Devolver un listado de usuarios paginado

function getUsers(req, res) {

    var userId = req.user.sub; //En esta variable recojemos el id del usuario que este logeado en este momento, en la autorizacion hicimos una propiedad user a la req con el middleware entonces ahi tenemos un objeto completo del usuario el cual nos esta mandando el token , el objeto del usuario que se ha decodificado del token , la propiedad 'sub' es el la propiedad declarada en el payload del token y contiene el id
    var page = 1; //siempre es 1, 


    if (req.params.page) { // Comprobar que nos llega la pagina por la url , page es la pagina que nosotros estamos recogiendo 
        page = req.params.page; // si existe el parametro page que nos llegapor la url entonces actualizamos su valor
    }
    var itemsPorPage = 7; //cantidad de elementos(usuarios) que se mostraran por pagina 
    //desde el modelo User llamamos al metodo find que nos trae todo lo que hay en la db, metodo sort ordena por id, y el metodo paginate es para paginar estos resultados y le pasamos la pagina(n° de pagina que estamos actualmente) y el itemsPorPagina(la cantidad de registros que hay por pagina), despues una funcion callBack que puede tener un err(error), users(todos los usuarios que va a devolver esta peticion a la base de datos) y un total(que es un count, que hace este paginate para sacar el total de registros que hay en la db)
    User.find().sort('_id').paginate(page, itemsPorPage, (err, users, total) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!users) return res.status(404).send({
            message: 'no hay usuarios disponibles'
        });
        followUsers(userId).then((value) => {
            return res.status(200).send({
                users,
                usersFollowing: value.following,//Usuarios que yo estoy siguiendo
                usersFollowed: value.followed, //Usuarios que me siguen
                total,
                pages: Math.ceil(total / itemsPorPage)  //numero de paginas totales que hay, math.ceil es para redondear el resultado de una division, y para sacar el total de paginas se divide el total, por itemsPorPagina 
            });
        });


    });
}
async function followUsers(userId) {
    try {
        var following = await Follow.find({ user: userId }).select({ _id: 0, __v: 0, user: 0 }).exec()  //metodo select permite seleccionar campos y el valor 0 es para no mostrarlos,en este caso solo vamos a mostrar el campo followed
            .then((following) => {

                return following;
            })
            .catch((err) => {
                return handleError(err);
            });

        var followed = await Follow.find({ followed: userId }).select({ _id: 0, __v: 0, followed: 0 }).exec()   //metodo select permite seleccionar campos y el valor 0 es para no mostrarlos,en este caso solo vamos a mostrar el campo followed
            .then((followed) => {

                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });

        //procesar following ids
        var arrayFollowing = [];
        following.forEach((follow) => {
            arrayFollowing.push(follow.followed);
            console.log(following);
        });
        //procesar followed ids
        var arrayFollowed = [];
        followed.forEach((follow) => {
            arrayFollowed.push(follow.user);
        });


        return {
            following: arrayFollowing,
            followed: arrayFollowed
        }
    } catch (e) {
        console.log(e);
    }
}

//Metodo para devolver contadores de seguidores y seguidos

function getCounter(req, res) {
    var userId = req.user.sub;
    if (req.params.id) {
        userId = req.params.id;
    }
    getCounterFollows(userId).then((value) => {
        return res.status(200).send({
            following: value.following,
            followed: value.followed,
            publcations: value.publications
        });
    });
}

//Funcion asincronica para obtener contador de seguidores y seguidos

async function getCounterFollows(userId) {
    try {
        var following = await Follow.count({ user: userId }).exec()
            .then((following) => {

                return following;
            })
            .catch((err) => {
                return handleError(err);
            });

        var followed = await Follow.count({ followed: userId }).exec()
            .then((followed) => {

                return followed;
            })
            .catch((err) => {
                return handleError(err);
            });
        var publications = await Publication.count({ user: userId }).exec()
            .then((publications) => {
                return publications;
            })
            .catch((err) => {
                return handleError(err)
            });
        return {
            following: following,
            followed: followed,
            publications: publications
        }
    } catch (e) {
        console.log(e);
    }
}
//Metodo para actualizar datos de un usuario 

function updateUser(req, res) {
    var userId = req.params.id; //En esta variable recojemos el id del usuario que este logeado en este momento
    var update = req.body; // Recogemos el body de la request 
    delete (update.password);// Eliminar password del obejto update  
    //comparar si el userId que estoy recibiendo por la url es diferente al user id que yo tengo en la request, porque este metodo para actualizar datos lo vamos a usar cuando el propio usuario que se a creado su cuenta pueda modificarse sus propios datos
    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizar tus datos' }); //si el usuario que nos llega por url no es igual al is del usuario que tenemos en la request
    }

    User.findOne({
        $or: [
            { email: update.email.toLowerCase() },
            { nick: update.nick.toLowerCase() }
        ]
    }).exec((err, user) => {
        if (user && user._id != userId) return res.status(200).send({ message: 'Los datos ya estan en uso de otro usuario' });
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {  // Mongo db por defecto nos trae el obejto del usuario anterior y no el objeto del usuario ya actualizado, para eso se usa el parametro {new:true} esto es un json que le dice a mongo que traiga el objeto ya actualizado

        if (err) return res.status(500).send({
            message: 'Error en la la peticion'
        });

        if (err) return res.status(404).send({
            message: 'No se ha podido actualizar el usuario'
        });
        return res.status(200).send({
            user: userUpdate
        });
    });
        
    });
    
}

//Subir archivos de imagen avatar de usuario

function uploadImage(req, res) {
    var userId = req.params.id; //En esta variable recojemos el id del usuario que este logeado en este momento


    if (req.files.image) {  //si existe files , es decir si estamos enviando algun fichero podremos subir el fichero en si y guardarlo e la db
        var file_path = req.files.image.path;  // sacamos el path completo de la imagen que queremos subir, image es el campo que estamos enviando por post y de ahi sacamos el campo path
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
        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg') {  //Si la extension del archivo que intentan subir es valido, entonces vamos a actualizar el objeto en la base de datos
            //actualizar documento del usuario logeado
            User.findByIdAndUpdate(userId, { image: fileName }, { new: true }, (err, userUpdate) => {
                if (err) return res.status(500).send({
                    message: 'Error en la la peticion'
                });

                if (err) return res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
                return res.status(200).send({
                    user: userUpdate
                });
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

//Devolver imagen de usuario va a ser una url que ira protegida por autenticacion y esta url no dara la imagen del usuario que nesesitemos y solo sera accesible por usuarios identificado

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;  // Va a ser un parametro que recoge por la url , el nombre de la image que le pasamos por la url 
    var pathFile = './uploads/users/' + imageFile; // ruta de la imagen 

    fs.exists((pathFile), (exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));  //sendFile es un metodo de express , esto nos devuelve el fichero
        } else {
            return res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });
}

//exportar en formato de objeto para despues acceder a los metodos de esta clase
module.exports = {
    home,
    pruebas,
    saveNewUser,
    loginNewUser,
    getDataUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    getCounter

}