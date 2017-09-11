const moment = require('moment');
const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const {
  ObjectID
} = require('mongodb');


const app = require('../app');

const {
  Tag
} = require('../models/tag');

const {
  populateTags,
  tags,
  populateUsers,
  users
} = require('./seed');

beforeEach(populateTags);
beforeEach(populateUsers);



describe('GET /tags', () => {
  it('should get all tags for admin user', (done) => {
    request(app)
      .get('/tags')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.tags.length).toBe(4);

      })
      .end(done);
  });

});


describe('POST /tags', () => {
  it('should create a new tag', (done) => {

    let tagName = "new tag";
    let tag = {
      tag: tagName,
    };

    request(app)
      .post('/tags')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(tag)
      .expect(200)
      .expect((res) => {
        expect(res.body.tag).toBe(tag.tag);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Tag.findOne({
          tag: tag.tag
        }).then((dbTag) => {
          expect(dbTag).toExist();
          expect(dbTag.addedDate).toExist();
          expect(dbTag._creator).toExist();
          expect(dbTag.tag).toBe(tag.tag);
          expect(new ObjectID(dbTag._creator).toHexString()).toEqual(users[0]._creatorRef.toHexString());
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create tag with invalid body data', (done) => {
    request(app)
      .post('/tags')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Tag.find().then((tags) => {
          expect(tags.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });


});


