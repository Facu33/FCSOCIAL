'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Los esquemas son las estructuras que van a tener los objetos
var MessageSchema = Schema({
    text:String,
    viewed:Boolean,
    file:String,
    created_at:String,
    emiter: { type: Schema.ObjectId, ref: 'User' },//Tipo :id de otro objeto y ref en referencia al objeto User
    receiver: { type: Schema.ObjectId, ref: 'User' }//Tipo: id de otro objeto y ref en referencia al objeto User
});

module.exports = mongoose.model('Message', MessageSchema);