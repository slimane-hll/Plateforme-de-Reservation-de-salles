const express = require('express')
const router = express.Router()
const Avis = require('../modeles/Avis')
const Salle = require('../modeles/Salle')
const Reservation = require('../modeles/Reservation')
const { authentifier, autoriserRole } = require('../middlewares/auth')

// Ajouter un avis : uniquement si le client a déjà réservé cette salle (réservation terminée)
router.post('/ajouter/:salleId', authentifier, autoriserRole('client'), async (req,res) => {
  const salle = await Salle.findById(req.params.salleId)
  if(!salle) return res.send('Salle introuvable')
  // Vérifier qu'il existe une réservation du client pour cette salle et que la réservation est terminée
  const now = new Date()
  const reservation = await Reservation.findOne({ client: req.user._id, salle: salle._id, dateFin: { $lte: now } })
  if(!reservation) return res.send('Vous ne pouvez laisser un avis que si vous avez réservé et terminé la réservation de cette salle')
  const { note, commentaire } = req.body
  const avis = new Avis({ client: req.user._id, salle: salle._id, note: parseInt(note||5), commentaire })
  await avis.save()
  res.redirect('/')
})
module.exports = router
