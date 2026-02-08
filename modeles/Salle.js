const mongoose = require('mongoose')
const Schema = mongoose.Schema
const salleSchema = new Schema({
  proprietaire: { type: Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  titre: { type: String, required: true },
  description: { type: String },
  capacite: { type: Number, default: 1 },
  prix: { type: Number, default: 0 },
  localisation: { adresse: { type: String } },
  createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model('Salle', salleSchema)
