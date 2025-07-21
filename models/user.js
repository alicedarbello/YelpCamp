const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
// isso irá adicionar username e password ao schema
// e garantir que seja unico e ñ seja duplicado
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);  