const mongoose = require('mongoose')
module.exports = function(){
  mongoose.connect('mongodb://127.0.0.1:27017/reservation')
    .then(() => console.log('MongoDB connecté'))
    .catch(err => { console.error('Erreur MongoDB', err); process.exit(1) })
}
