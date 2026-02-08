const express = require('express')
const router = express.Router()
const Reservation = require('../modeles/Reservation')
const Salle = require('../modeles/Salle')
const { authentifier, autoriserRole } = require('../middlewares/auth')
router.get('/mon-historique', authentifier, autoriserRole(['client','proprietaire','admin']), async (req,res) => {
  const reservations = await Reservation.find({ client: req.user._id }).populate('salle')
  res.render('historique', { reservations })
})
router.post('/reserver/:id', authentifier, autoriserRole(['client']), async (req,res) => {
  const salle = await Salle.findById(req.params.id)
  if(!salle) return res.send('Salle introuvable')
  const { dateDebut, dateFin } = req.body
  const debut = new Date(dateDebut)
  const fin = new Date(dateFin)
  if(isNaN(debut.getTime()) || isNaN(fin.getTime())) return res.send('Dates invalides')
  if(fin < debut) return res.send('La date de fin doit être supérieure ou égale à la date de début')
  const conflit = await Reservation.findOne({ salle: salle._id, $or: [{ dateDebut: { $lt: fin, $gte: debut } }, { dateFin: { $gt: debut, $lte: fin } }, { dateDebut: { $lte: debut }, dateFin: { $gte: fin } }] })
  if(conflit) return res.send('Conflit de réservation')
  const jours = Math.max(1, Math.ceil((fin - debut)/(1000*60*60*24)))
  const prix = (salle.prix || 0) * jours
  const reservation = new Reservation({ client: req.user._id, salle: salle._id, dateDebut: debut, dateFin: fin, prixTotal: prix })
  await reservation.save()
  res.redirect('/reservations/mon-historique')
})

// Annuler une réservation (client ou admin)
router.post('/annuler/:id', authentifier, async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
  if(!reservation) return res.send('Réservation introuvable')
  if(String(reservation.client) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).send('Accès refusé')
  await Reservation.findByIdAndDelete(req.params.id)
  res.redirect('/reservations/mon-historique')
})

// Vue pour propriétaire : voir les réservations de ses salles
router.get('/proprietaire/mes-reservations', authentifier, autoriserRole(['proprietaire','admin']), async (req, res) => {
  const sallesDuProprio = await Salle.find({ proprietaire: req.user._id }).distinct('_id')
  const reservations = await Reservation.find({ salle: { $in: sallesDuProprio } }).populate('salle').populate('client', 'nom email')
  res.render('reservations_proprio', { reservations })
})
module.exports = router

