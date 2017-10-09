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
  Media
} = require('../models/media');

const {
  populateMedias,
  medias,
  populateUsers,
  users,
  populateComments,
  comments,
  populatePeople,
  people,
  populateTags,
  tags
} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateComments);
beforeEach(populateTags);
beforeEach(populatePeople);
beforeEach(populateMedias);

describe('GET /medias/byCriteria', () => {

  it('should get all medias for admin user for tag1 and tag3, person1 and person3, and between 2 dates', (done) => {
    let fromDate = moment(medias[0].mediaDate).valueOf();
    let toDate = moment(medias[1].mediaDate).valueOf();
    let body = {
      tags: [tags[0]._id, tags[2]._id],
      fromDate,
      toDate,
      people: [people[0]._id, people[2]._id]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(2);
      })
      .end(done);
  });

  it('should get all medias for admin user for tag1, person1 and person2, and between 2 dates', (done) => {
    let fromDate = moment(medias[0].mediaDate).valueOf();
    let toDate = moment(medias[1].mediaDate).valueOf();
    let body = {
      tags: [tags[0]._id],
      fromDate,
      toDate,
      people: [people[0]._id, people[1]._id]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(1);
      })
      .end(done);
  });

  it('should get all medias for admin user for tag1, person1 and person2, and fromDate', (done) => {
    let fromDate = moment(medias[0].mediaDate).valueOf();
    let body = {
      tags: [tags[0]._id],
      fromDate,
      people: [people[0]._id, people[1]._id]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(1);
      })
      .end(done);
  });

  it('should get all medias for admin user for tag1, person1 and person2, and toDate', (done) => {
    let toDate = moment(medias[1].mediaDate).valueOf();
    let body = {
      tags: [tags[0]._id],
      toDate,
      people: [people[0]._id, people[1]._id]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(1);
      })
      .end(done);
  });

  it('should not get any medias for admin user for invalid tag tag5', (done) => {
    let toDate = moment(medias[1].mediaDate).valueOf();
    let body = {
      tags: [new ObjectID()]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(0);
      })
      .end(done);
  });

  it('should not get any medias for admin user for invalid tag', (done) => {
    let toDate = moment(medias[1].mediaDate).valueOf();
    let body = {
      tags: [new ObjectID()]
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(0);
      })
      .end(done);
  });

  it('should not get any medias for dates in the future', (done) => {
    let toDate = moment(medias[1].mediaDate).add(2, 'days').valueOf();
    let fromDate = moment(medias[1].mediaDate).add(1, 'days').valueOf();
    let body = {
      fromDate,
      toDate
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(0);
      })
      .end(done);
  });
  it('should not get any medias for dates in the past', (done) => {
    let toDate = moment(medias[0].mediaDate).subtract(1, 'days').valueOf();
    let fromDate = moment(medias[0].mediaDate).subtract(2, 'days').valueOf();
    let body = {
      fromDate,
      toDate
    };
    request(app)
      .get('/medias/byCriteria')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(0);
      })
      .end(done);
  });

});

describe('GET /medias', () => {
  it('should get all medias for admin user', (done) => {
    request(app)
      .get('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(2);
        expect(res.body.medias[0].comments.length).toBe(1);
        expect(res.body.medias[0].comments[0].user.name).toBe(users[0].name);
      })
      .end(done);
  });

  it('should get all medias for non-admin user', (done) => {
    request(app)
      .get('/medias')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.length).toBe(2);
      })
      .end(done);
  });
});



describe('GET /medias/:id', () => {
  it('should get media for id', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.people[0]._id).toBe(people[0]._id.toHexString());
        expect(res.body.media.people[1]._id).toBe(people[1]._id.toHexString());
      })
      .end(done);
  });

  it('should return 404 if media not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .get('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });
});

//it.only()

describe('POST /medias', () => {
  it('should create a new media', (done) => {

    let media = {
      location: "/media/media2.mpeg",
      isUrl: true,
      mimeType: "video/mpeg",
      description: "Movie 2",
      title: 'New Title',
      mediaDate: 14565623,
      tags: [tags[0]._id, tags[3]._id],
      people: [people[1]._id]
    };

    request(app)
      .post('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .field('media', JSON.stringify(media))
      .expect(200)
      .expect((res) => {
        expect(res.body.location).toBe(media.location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findOne({
          location: media.location
        }).then((dbMedia) => {
          expect(dbMedia).toExist();
          expect(dbMedia.addedDate).toExist();
          expect(dbMedia._creator).toExist();
          expect(dbMedia.location).toBe(media.location);
          expect(dbMedia.title).toBe(media.title);
          expect(new ObjectID(dbMedia._creator).toHexString()).toEqual(users[0]._creatorRef.toHexString());
          expect(dbMedia.people[0]).toEqual(people[1]._id.toHexString());
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create media with invalid body data', (done) => {
    request(app)
      .post('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .field('media', JSON.stringify({}))
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.find().then((medias) => {
          expect(medias.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });


});


describe('DELETE /medias', () => {
  it('should delete all medias if admin user', (done) => {
    request(app)
      .delete('/medias')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.n).toBe(2);
      })
      .end(done);
  });

  it('should delete only user\'s medias if not admin user', (done) => {
    request(app)
      .delete('/medias')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.medias.n).toBe(1);
      })
      .end(done);
  });
});

describe('DELETE /medias/:id', () => {
  it('should delete media for id', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(medias[0].location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should delete media for id for admin user', (done) => {
    let id = medias[1]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.location).toBe(medias[1].location);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not delete media for id for non-admin user', (done) => {
    let id = medias[0]._id.toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media).toExist();
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if media not found', (done) => {
    let id = new ObjectID().toHexString();
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let id = 'x';
    request(app)
      .delete('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });


});

describe('UPDATE /medias/:id', () => {


  it('should update media for id', (done) => {
    let media = _.clone(medias[0]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    let id = medias[0]._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.description).toBe(newDescription);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media.description).toBe(newDescription);
          done();
        }).catch((e) => done(e));

      });
  });


  it('should update media for id and save comment', (done) => {
    let media = _.clone(medias[0]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    media.comment = "This is a comment";
    let id = medias[0]._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.description).toBe(newDescription);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).populate('comments tags people').then((media) => {
          expect(media.description).toBe(newDescription);
          expect(media.comments.length).toBe(2);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not update media for id not owned and not admin', (done) => {
    let media = _.clone(medias[0]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    let id = media._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Media.findById(id).then((media) => {
          expect(media.description).toBe(oldDescription);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should  update media for id not owned but admin', (done) => {
    let media = _.clone(medias[1]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    let id = media._id.toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.media._id).toBe(id);
        expect(res.body.media.description).toBe(newDescription);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Media.findById(id).then((media) => {
          expect(media.description).toBe(newDescription);
          done();
        }).catch((e) => done(e));

      });
  });



  it('should return 404 if media not found', (done) => {
    let media = _.clone(medias[0]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    let id = new ObjectID().toHexString();
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("media not found for id");
      })
      .end(done);
  });

  it('should return 404 of non ObjectID\'s', (done) => {
    let media = _.clone(medias[0]);
    let oldDescription = media.description;
    let newDescription = media.description + ' UPDATED';
    media.description = newDescription;
    let id = 'x';
    request(app)
      .patch('/medias/' + id)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        media: JSON.stringify(media)
      })
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe("Media ID is invalid");
      })
      .end(done);
  });
});
