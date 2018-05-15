'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Los esquemas son las estructuras que van a tener los objetos
var PublicationSchema = Schema({
    text: String,
    file: String,
    created_at: String,
    user: { type: Schema.ObjectId, ref: 'User' } //:Tipo id de otro objeto y ref en referencia al objeto User
});

module.exports = mongoose.model('Publication', PublicationSchema);