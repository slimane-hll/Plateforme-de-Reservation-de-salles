const mongoose = require('mongoose')
const Schema = mongoose.Schema
const reservationSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  salle: { type: Schema.Types.ObjectId, ref: 'Salle', required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  prixTotal: { type: Number },
  createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Reservation', reservationSchema)
