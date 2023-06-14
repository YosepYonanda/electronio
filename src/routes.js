const express = require('express');
const {
  getKomponen,
  getKomponenByid,
  getArticle,
  getArticleByid,
} = require('./handler');

const router = express.Router();

router.get('/komponen', getKomponen);
router.get('/komponen/:id', getKomponenByid);
router.get('/article', getArticle);
router.get('/article/:id', getArticleByid);

module.exports = router;
