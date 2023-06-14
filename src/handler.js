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

// Konfigurasi Google Cloud Storage
const storage = new Storage({
  projectId: 'elektronio',
  keyFilename: 'path-to-service-account-key-file.json',
});

const bucketName = 'post_image_elektronio';

// Fungsi untuk mengunggah file ke Google Cloud Storage
async function uploadFileToGCS(fileBuffer, filename) {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    await file.save(fileBuffer);

    return `gs://${bucketName}/${filename}`;
  } catch (error) {
    console.error('Error uploading file to Google Cloud Storage:', error);
    throw error;
  }
}

// Fungsi untuk melakukan prediksi menggunakan TensorFlow Serving
async function classifyImage(imageURL) {
  const data = JSON.stringify({
    signature_name: 'serving_default',
    instances: [{ image_uri: imageURL }],
  });

  try {
    const response = await axios.post('http://localhost:8501/v1/models/elektronio:predict', data, {
      headers: { 'Content-Type': 'application/json' },
    });

    const { predictions } = response.data;
    const predictedClass = predictions[0].indexOf(Math.max(...predictions[0]));
    return predictedClass;
  } catch (error) {
    console.error('Error classifying image:', error);
    throw error;
  }
}

app.post('/classify', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const fileBuffer = req.file.buffer;
  const filename = `${Date.now()}-${req.file.originalname}`;

  try {
    const imageURL = await uploadFileToGCS(fileBuffer, filename);
    const predictedClass = await classifyImage(imageURL);

    // Menghapus file di Google Cloud Storage
    await storage.bucket(bucketName).file(filename).delete();

    return res.json({ class: predictedClass });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = {
  getKomponen,
  getKomponenByid,
  getArticle,
  getArticleByid,
};
