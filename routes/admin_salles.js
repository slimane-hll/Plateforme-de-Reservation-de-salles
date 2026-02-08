const express = require('express')
const router = express.Router()
const Salle = require('../modeles/Salle')
const { authentifier, autoriserRole } = require('../middlewares/auth')

router.get('/admin/salles', authentifier, autoriserRole(['admin']), async (req, res) => {
  const salles = await Salle.find()
  res.render('admin_salles', { salles })
})

module.exports = router
