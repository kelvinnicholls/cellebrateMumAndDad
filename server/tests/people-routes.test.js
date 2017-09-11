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
  Person
} = require('../models/person');

const {
  populatePeople,
  people,
  populateUsers,
  users
} = require('./seed');

beforeEach(populatePeople);
beforeEach(populateUsers);



describe('GET /people', () => {
  it('should get all people for admin user', (done) => {
    request(app)
      .get('/people')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.people.length).toBe(4);

      })
      .end(done);
  });

});


describe('POST /people', () => {
  it('should create a new person', (done) => {

    let personName = "new person";
    let person = {
      person: personName,
    };

    request(app)
      .post('/people')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(person)
      .expect(200)
      .expect((res) => {
        expect(res.body.person).toBe(person.person);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Person.findOne({
          person: person.person
        }).then((dbPerson) => {
          expect(dbPerson).toExist();
          expect(dbPerson.addedDate).toExist();
          expect(dbPerson._creator).toExist();
          expect(dbPerson.person).toBe(person.person);
          expect(new ObjectID(dbPerson._creator).toHexString()).toEqual(users[0]._creatorRef.toHexString());
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create person with invalid body data', (done) => {
    request(app)
      .post('/people')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Person.find().then((people) => {
          expect(people.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });


});


