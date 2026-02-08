const express = require('express')
const router = express.Router()
const Avis = require('../modeles/Avis')
const { authentifier, autoriserRole } = require('../middlewares/auth')

// Afficher tous les avis (admin)
router.get('/', authentifier, autoriserRole('administrateur'), async (req, res) => {
  const avis = await Avis.find().populate('client', 'nom email').populate('salle', 'titre').sort({ createdAt: -1 })
  res.render('admin_avis', { avis })
})

// Supprimer un avis (admin)
router.post('/supprimer/:id', authentifier, autoriserRole('administrateur'), async (req, res) => {
  await Avis.findByIdAndDelete(req.params.id)
  res.redirect('/admin/avis')
})

module.exports = router
