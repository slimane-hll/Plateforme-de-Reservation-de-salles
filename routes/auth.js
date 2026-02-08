const express = require('express')
const router = express.Router()
const Utilisateur = require('../modeles/Utilisateur')
const { signerToken } = require('../middlewares/auth')
const ADMIN_EMAIL = 'admin@admin.com'
const ADMIN_PWD = 'admin'
router.get('/inscription', (req,res) => {
  const message = req.query.message
  res.render('inscription', { message })
})
router.post('/inscription', async (req,res) => {
  const { nom, email, motDePasse, role } = req.body
  const exists = await Utilisateur.findOne({ email })
  if(exists) return res.render('inscription', { message: 'Email déjà utilisé' })
  const user = new Utilisateur({ nom, email, motDePasse, role: role || 'client' })
  // user.actif defaults to false — attente activation admin
  await user.save()
  // Ne pas connecter automatiquement l'utilisateur
  res.redirect('/connexion?message=attente')
})
router.get('/connexion', (req,res) => {
  const message = req.query.message
  res.render('connexion', { message })
})
router.post('/connexion', async (req,res) => {
  const { email, motDePasse } = req.body
  if(email === ADMIN_EMAIL && motDePasse === ADMIN_PWD){
    let user = await Utilisateur.findOne({ email })
    if(!user){
      user = new Utilisateur({ nom: 'Administrateur', email, motDePasse, role: 'admin' })
      await user.save()
    }
    const token = signerToken(user)
    res.cookie('token', token, { httpOnly:true })
    return res.redirect('/')
  }
  const user = await Utilisateur.findOne({ email })
  if(!user) return res.render('connexion', { message: 'Utilisateur introuvable' })
  if(user.actif === false) return res.render('connexion', { message: 'Compte en attente d\'activation par l\'administrateur' })
  const ok = await user.comparerMotDePasse(motDePasse)
  if(!ok) return res.render('connexion', { message: 'Mot de passe incorrect' })
  const token = signerToken(user)
  res.cookie('token', token, { httpOnly:true })
  res.redirect('/')
})
router.get('/deconnexion', (req,res) => {
  res.clearCookie('token')
  res.redirect('/')
})
module.exports = router

