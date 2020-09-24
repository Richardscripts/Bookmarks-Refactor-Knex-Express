const express = require('express');
const logger = require('../logger');
const BookmarksServices = require('../bookmarks-services');

const bookmarkRouter = express.Router();

bookmarkRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');
    BookmarksServices.getAllItems(db)
      .then((results) => {
        res.send(results);
      })
      .catch(next);
  })
  .post(express.json(), (req, res, next) => {
    const db = req.app.get('db');
    const { title, rating, url, description = '' } = req.body;
    const newbookMark = { title, rating, url, description };

    const required = ['title', 'url', 'rating'];
    for (let key of required) {
      if (!req.body[key]) {
        return res.status(400).send(`Missing ${key} in request`);
      }
    }

    if (!req.body.url.startsWith('http')) {
      logger.error('Url does not begin with http');
      return res.status(400).send('URL must include "http"');
    }

    if (isNaN(req.body.rating)) {
      logger.error('Rating not found');
      return res.status(400).send('Rating must be a numeric value');
    }

    BookmarksServices.insertItem(db, newbookMark)
      .then((results) => {
        res
          .status(201)
          .location(`http://localhost:8000/bookmark/${results.id}`)
          .json(results);
      })
      .catch(next);
  });

bookmarkRouter
  .route('/:id')
  .get((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    BookmarksServices.getById(db, id)
      .then((foundBookmark) => {
        if (!foundBookmark) {
          return res.status(404).json({ error: 'Bookmark ID not found' });
        }
        res.send(foundBookmark);
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const db = req.app.get('db');
    const { id } = req.params;
    BookmarksServices.getById(db, id)
      .then((index) => {
        //const index = bookmarkData.findIndex((bookmark) => bookmark.id == id);
        if (!index) {
          logger.error(`Bookmark id: ${id} not Found`);
          return res.status(404).send('Bookmark not found');
        }
        BookmarksServices.deleteItem(db, id).then(() => {
          res.send(`Bookmark ${id} deleted`);
        });
      })
      .catch(next);
  });

module.exports = bookmarkRouter;
