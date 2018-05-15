'use strict'
var Message = require('../models/message');
var User = require('../models/user');
var Follow = require('../models/follow');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

function pruebaMessage(req, res) {
    return res.status(200).send({
        message: 'Accion de pruebas desde message'
    });
}

//Nuevo mensaje

function saveMessage(req, res) {
    var params = req.body;
    var message = new Message();
    if (!params.text || !params.receiver) {
        return res.status(200).send({
            message: 'Envia los datos nesesarios'
        });
    } else {
        message.text = params.text;
        message.file = null;
        message.emiter = req.user.sub;
        message.receiver = params.receiver;
        message.created_at = moment().unix();
        message.viewed = false;
        message.save((err, messageStored) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la peticion'
                });
            }
            if (!messageStored) {
                return res.status(404).send({
                    message: 'El mensaje no se ha guardado'
                });
            }
            return res.status(200).send({
                message: messageStored
            });
        });

    }
}

//Listar mensajes recibidos 

function getListMessageReciev(req, res) {

    var userId = req.user.sub;
    var page = 1;
    var itemsPerPage = 4;
    if (req.params.page) {
        page = req.params.page;
    }

    Message.find({ receiver: userId }).populate('emiter', 'name surname _id email nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!messages) {
            return res.status(404).send({
                message: 'No hay mensajes '
            });
        }
        return res.status(200).send({
            messages,
            total,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)  //numero de paginas totales que hay, math.ceil es para redondear el resultado de una division, y para sacar el total de paginas se divide el total, por itemsPorPagina 
        });


    })
}

//Listar mensajes enviados 

function getListMessageSend(req, res) {

    var userId = req.user.sub;
    var page = 1;
    var itemsPerPage = 4;
    if (req.params.page) {
        page = req.params.page;
    }

    Message.find({ emiter: userId }).populate('emiter receiver', 'name surname _id email nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        if (!messages) {
            return res.status(404).send({
                message: 'No hay mensajes '
            });
        }
        return res.status(200).send({
            messages,
            total,
            itemsPerPage,
            pages: Math.ceil(total / itemsPerPage)  //numero de paginas totales que hay, math.ceil es para redondear el resultado de una division, y para sacar el total de paginas se divide el total, por itemsPorPagina 
        });


    })
}

//Buscar y contar mensajes recibidos pero no leidos

function getUnviewed(req,res){
    var userId = req.user.sub;
    Message.count({receiver : userId,viewed:false}).exec((err,messages) =>{
        if (err) return res.status(500).send({
            message: 'Error en la peticion'
        });
        return res.status(200).send({
            messages 
        });

    });
}

//Actualizar mensajes leidos

function updateViewMessage(req,res){
var userId=req.user.sub;

Message.update({receiver:userId,viewed:false},{viewed:true},{"multi":true},(err,messageUpdate) =>{
    if (err) return res.status(500).send({
        message: 'Error en la peticion'
    });
    return res.status(200).send({
        messages :messageUpdate
    });
})
}
module.exports = {
    pruebaMessage,
    saveMessage,
    getListMessageSend,
    getListMessageReciev,
    getUnviewed,
    updateViewMessage
}
