const mongoose = require('mongoose')
const Schema = mongoose.Schema
const avisSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  salle: { type: Schema.Types.ObjectId, ref: 'Salle', required: true },
  note: { type: Number, min: 1, max: 5 },
  commentaire: { type: String },
  createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Avis', avisSchema)
