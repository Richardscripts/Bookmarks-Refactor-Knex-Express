require('dotenv').config();
const supertest = require('supertest');
const knex = require('knex');
const Bookmarks = require('./bookmark.fixture');
const { API_TOKEN, TEST_DB_URL } = require('../src/config');
const app = require('../src/app');
const { expect } = require('chai');

describe('All CRUD methods work properly', () => {
  let db;
  before(() => {
    db = knex({
      client: 'pg',
      connection: TEST_DB_URL,
    });
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db('bookmarks').truncate());
  context('Given there are bookmarks in the database', () => {
    const testBookmarks = Bookmarks();
    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });
    it('GET /bookmarks responds with 200 and all of the articles', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', 'bearer ' + API_TOKEN)
        .expect(200)
        .expect((results) => {
          expect(results.body).to.be.an('array');
          expect(results.body[0].title).to.eql(testBookmarks[0].title);
          expect(results.body[0].rating).to.eql(testBookmarks[0].rating);
          expect(results.body[0].description).to.eql(
            testBookmarks[0].description
          );
          expect(results.body[0].url).to.eql(testBookmarks[0].url);
          return db
            .into('bookmarks')
            .select('*')
            .first()
            .then((results) => {
              expect(results.title).to.eql(testBookmarks[0].title);
            });
        });
    });
    it('POST /bookmarks responds with 201 and posts to database correctly', () => {
      const newBookmark = testBookmarks[0];
      return supertest(app)
        .post('/bookmarks')
        .set('Authorization', 'bearer ' + API_TOKEN)
        .send(newBookmark)
        .expect(201)
        .expect((result) => {
          expect(result.body.title).to.eql(newBookmark.title);
          expect(result.body.rating).to.eql(newBookmark.rating);
          expect(result.body.description).to.eql(newBookmark.description);
        });
    });
    it('DELETE /bookmarks deletes bookmark in database correctly', () => {
      const id = 1;
      return supertest(app)
        .delete(`/bookmarks/${id}`)
        .set('Authorization', 'bearer ' + API_TOKEN)
        .expect(200)
        .expect(() => {
          return db
            .into('bookmarks')
            .select('*')
            .where('id', id)
            .first()
            .then((results) => {
              expect(results).to.eql(undefined);
            });
        });
    });
  });
});
