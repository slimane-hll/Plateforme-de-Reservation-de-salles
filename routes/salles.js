const express = require('express')
const router = express.Router()
const Salle = require('../modeles/Salle')
const { authentifier, autoriserRole } = require('../middlewares/auth')
router.get('/', async (req,res) => {
  // Retourne toutes les salles — ne pas masquer les salles réservées
  const salles = await Salle.find()
  res.render('accueil', { salles })
})
router.get('/ajouter', authentifier, autoriserRole(['proprietaire','admin']), (req,res) => res.render('ajouter_salle'))
router.post('/ajouter', authentifier, autoriserRole(['proprietaire','admin']), async (req,res) => {
  const { titre, description, capacite, prix, adresse } = req.body
  const salle = new Salle({ proprietaire: req.user._id, titre, description, capacite, prix, localisation: { adresse } })
  await salle.save()
  res.redirect('/salles')
})
router.get('/modifier/:id', authentifier, autoriserRole(['proprietaire','admin']), async (req,res) => {
  const salle = await Salle.findById(req.params.id)
  if(!salle) return res.send('Salle introuvable')
  if(String(salle.proprietaire) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).send('Accès refusé')
  res.render('modifier_salle', { salle })
})
router.post('/modifier/:id', authentifier, autoriserRole(['proprietaire','admin']), async (req,res) => {
  const salle = await Salle.findById(req.params.id)
  if(!salle) return res.send('Salle introuvable')
  if(String(salle.proprietaire) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).send('Accès refusé')
  const { titre, description, capacite, prix, adresse } = req.body
  salle.titre = titre
  salle.description = description
  salle.capacite = capacite
  salle.prix = prix
  salle.localisation = { adresse }
  await salle.save()
  res.redirect('/salles')
})
router.post('/supprimer/:id', authentifier, autoriserRole(['proprietaire','admin']), async (req,res) => {
  const salle = await Salle.findById(req.params.id)
  if(!salle) return res.send('Salle introuvable')
  if(String(salle.proprietaire) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).send('Accès refusé')
  await Salle.findByIdAndDelete(req.params.id)
  res.redirect('/salles')
})
module.exports = router
// Route pour proprietaire: voir ses salles et avis
router.get('/proprietaire/mes-salles', authentifier, autoriserRole(['proprietaire','admin']), async (req,res) => {
  const salles = await Salle.find({ proprietaire: req.user._id })
  const Avis = require('../modeles/Avis')
  const sallesAvecAvis = await Promise.all(salles.map(async s => {
    const avis = await Avis.find({ salle: s._id }).populate('client', 'nom').lean()
    return { salle: s.toObject(), avis }
  }))
  res.render('mes_salles', { salles: sallesAvecAvis })
})

// Afficher les avis d'une salle (accessible à tous)
router.get('/:id/avis', async (req, res) => {
  const salle = await Salle.findById(req.params.id)
  if(!salle) return res.send('Salle introuvable')
  const Avis = require('../modeles/Avis')
  const avis = await Avis.find({ salle: salle._id }).populate('client', 'nom email').sort({ createdAt: -1 })
  res.render('avis_salle', { salle, avis })
})

