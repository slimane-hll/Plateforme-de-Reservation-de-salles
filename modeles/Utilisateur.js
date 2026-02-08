const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema
const utilisateurSchema = new Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  role: { type: String, enum: ['client','proprietaire','admin'], default: 'client' },
  actif: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})
utilisateurSchema.pre('save', async function(){
  if(!this.isModified('motDePasse')) return
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10)
})
utilisateurSchema.methods.comparerMotDePasse = function(mdpt){
  return bcrypt.compare(mdpt, this.motDePasse)
}
module.exports = mongoose.model('Utilisateur', utilisateurSchema)
