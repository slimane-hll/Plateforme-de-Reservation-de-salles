const jwt = require('jsonwebtoken')
const Utilisateur = require('../modeles/Utilisateur')
const cle = 'cle_jwt_demo'
exports.authentifier = async function(req,res,next){
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1] || req.cookies && req.cookies.token
  if(!token) return res.redirect('/connexion')
  try{
    const payload = jwt.verify(token, cle)
    req.user = await Utilisateur.findById(payload.id)
    next()
  }catch(e){
    return res.redirect('/connexion')
  }
}
// middleware optionnel pour injecter l'utilisateur dans templates sans forcer l'auth
exports.injecterUtilisateur = async function(req,res,next){
  res.locals.user = null
  const token = req.cookies && req.cookies.token
  if(!token) return next()
  try{
    const payload = jwt.verify(token, cle)
    const u = await Utilisateur.findById(payload.id)
    if(u) { req.user = u; res.locals.user = { _id: u._id, nom: u.nom, role: u.role } }
  }catch(e){ /* ignore invalid token */ }
  next()
}
exports.autoriserRole = function(roles){
  return function(req,res,next){
    if(!req.user) return res.status(401).send('Non authentifié')
    if(!roles.includes(req.user.role)) return res.status(403).send('Accès refusé')
    next()
  }
}
exports.signerToken = function(utilisateur){
  return jwt.sign({ id: utilisateur._id }, cle, { expiresIn: '7d' })
}
