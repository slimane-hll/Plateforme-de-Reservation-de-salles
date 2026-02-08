const express = require('express')
const router = express.Router()
const Utilisateur = require('../modeles/Utilisateur')
const { authentifier, autoriserRole } = require('../middlewares/auth')
router.get('/admin/utilisateurs', authentifier, autoriserRole(['admin']), async (req,res) => {
  const utilisateurs = await Utilisateur.find()
  res.render('admin', { utilisateurs })
})
router.post('/admin/utilisateurs/etat/:id', authentifier, autoriserRole(['admin']), async (req,res) => {
  const u = await Utilisateur.findById(req.params.id)
  if(!u) return res.send('Utilisateur introuvable')
  if(u.role === 'admin') return res.send('Impossible de modifier un compte admin')
  u.actif = !u.actif
  await u.save()
  res.redirect('/admin/utilisateurs')
})
module.exports = router
