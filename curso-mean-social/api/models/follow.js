'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; // Los esquemas son las estructuras que van a tener los objetos
var FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },//Tipo: id de otro objeto y ref en referencia al objeto User
    followed: { type: Schema.ObjectId, ref: 'User' }//Tipo: id de otro objeto y ref en referencia al objeto User
});

module.exports = mongoose.model('Follow', FollowSchema);