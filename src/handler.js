/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
const express = require('express');
const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const { db } = require('./database');

const app = express();
const upload = multer();

const getKomponen = (req, res) => {
  db.query('SELECT * FROM komponen', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching komponen data',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

const getKomponenByid = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM komponen WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching komponen data',
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Komponen not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: results[0],
    });
  });
};

const getArticle = (req, res) => {
  db.query('SELECT * FROM article', (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching komponen data',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: results,
    });
  });
};

const getArticleByid = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM article WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching komponen data',
      });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Komponen not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: results[0],
    });
  });
};

module.exports = {
  getKomponen,
  getKomponenByid,
  getArticle,
  getArticleByid,
};
