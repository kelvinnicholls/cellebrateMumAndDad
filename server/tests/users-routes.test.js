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
  User,
  seed
} = require('../models/user');

const {
  populateUsers,
  users
} = require('./seed');


const {
  CONSTS
} = require('../shared/consts');

const {
  Media
} = require('../models/media');


beforeEach(populateUsers);

describe('GET /users/getEncryptedPassword', () => {

  it('should return encrypted password if admin user', (done) => {
    request(app)
      .get('/users/getEncryptedPassword')
      .set({
        'x-auth': users[0].tokens[0].token,
        'password': users[0].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.hash).toNotBe(users[0].password);
      })
      .end(done);
  });

  it('should return 401 if not admin user when requesting encrypted password', (done) => {
    request(app)
      .get('/users/getEncryptedPassword')
      .set({
        'x-auth': users[1].tokens[0].token,
        'password': users[1].password
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.ONLY_ADMIN_USERS_CAN_USE_THIS_FUNCTION);
      })
      .end(done);
  });

});


describe('GET /users/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set({
        'x-auth': 'xx'
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});


describe('GET /users/', () => {

  it('should return all user\s if admin user', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2);
      })
      .end(done);
  });

  it('should return current user if not admin user', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
      })
      .end(done);
  });


  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users')
      .set({
        'x-auth': 'xx'
      })
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});

describe('POST /users', () => {
  it('should create a user if admin user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };

    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        let access = 'auth';
        let token = jwt.sign({
          _id: res.body._id,
          access
        }, seed).toString();
        expect(res.body.email).toExist();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email
        }).then((dbUser) => {
          expect(dbUser).toExist();
          expect(dbUser._creator).toExist();
          expect(dbUser.email).toBe(email);
          expect(dbUser.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should create a user with a profile picture if admin user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };

    let fileName = 'darts.jpg';

    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .field('user', JSON.stringify(user))
      .attach('file', './server/tests/' + fileName)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(email);
        let access = 'auth';
        let token = jwt.sign({
          _id: res.body._id,
          access
        }, seed).toString();
        expect(res.body.email).toExist();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email
        }).then((dbUser) => {
          expect(dbUser).toExist();
          expect(dbUser._creator).toExist();
          expect(dbUser._profileMediaId).toExist();
          expect(dbUser.email).toBe(email);
          expect(dbUser.password).toNotBe(password);

          Media.findOne({
            'originalFileName': fileName
          }).then((media) => {
            expect(media).toExist();
            expect(media._id.toHexString()).toBe(dbUser._profileMediaId.toHexString());
            done();
          }).catch((e) => done(e));
        }).catch((e) => done(e));
      });
  });

  it('should create not create a user if name already exists', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = users[0].name;
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.AN_ERROR_OCURRED);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.find({
          name
        }).then((dbUsers) => {
          expect(dbUsers).toExist();
          expect(dbUsers.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });


  it('should create not create a user if email already exists', (done) => {
    let email = users[0].email;
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.AN_ERROR_OCURRED);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.find({
          email
        }).then((dbUsers) => {
          expect(dbUsers).toExist();
          expect(dbUsers.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create a user if not admin user', (done) => {
    let email = 'email3@email.com';
    let password = 'email3.password';

    let name = "Kelvin";
    let adminUser = true;
    let relationship = "Son";
    let dob = 2342323;
    let user = {
      email,
      password,
      name,
      adminUser,
      relationship,
      dob
    };
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(401)
      .end((err) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          email
        }).then((user) => {
          expect(user).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });


  it('should return validation errors if request invalid', (done) => {
    let email = 'email4.email.com';
    let password = 'email4.password';
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify({
          email,
          password
        })
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.AN_ERROR_OCURRED);
      })
      .end(done);
  });

  it('should not create a user if email in use', (done) => {
    let email = users[0].email;
    let password = users[0].password;
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify({
          email,
          password
        })
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.AN_ERROR_OCURRED);
      })
      .end(done);
  });

  it('should not create a user if name in use', (done) => {
    let name = users[0].name;
    let email = 'email5.email.com';
    let password = 'email5.password';
    request(app)
      .post('/users/')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify({
          email,
          password,
          name
        })
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.AN_ERROR_OCURRED);
      })
      .end(done);
  });
});


describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    let email = users[1].email;
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(users[1].email);
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (password)', (done) => {
    let email = users[1].email;
    let password = users[1].password + "x";
    request(app)
      .post('/users/login')
      .type('form')
      .send({
        user: JSON.stringify({
          email,
          password
        })
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login (email)', (done) => {
    let email = users[1].email + "x";
    let password = users[1].password;
    request(app)
      .post('/users/login')
      .type('form')
      .send({
        user: JSON.stringify({
          email,
          password
        })
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});


describe('DELETE /users/me/token', () => {

  it('should remove auth token on logout', (done) => {
    let email = users[0].email;
    let password = users[0].password;
    request(app)
      .delete('/users/me/token')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(CONSTS.USER_SUCCESSFULLY_LOGGED_OUT);
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

});

describe('UPDATE /users/:_creatorRef', () => {

  it('should update user for _creatorRef if token for logged in user', (done) => {
    let user = _.clone(users[1]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = user._creatorRef;

    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should update user for _creatorRef and create profile picture if token for logged in user', (done) => {
    let user = _.clone(users[1]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = user._creatorRef;
    let fileName = 'darts.jpg';
    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .field('user', JSON.stringify(user))
      .attach('file', './server/tests/' + fileName)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user).toExist();
          expect(user.name).toBe(newName);
          Media.findOne({
            'originalFileName': fileName
          }).then((media) => {
            expect(media).toExist();
            expect(media._id.toHexString()).toBe(user._profileMediaId.toHexString());
            done();
          }).catch((e) => done(e));
        }).catch((e) => done(e));
      });
  });

  it('should update user if logged in as admin and user is not you', (done) => {
    let user = _.clone(users[1]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = user._creatorRef;
    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not update user for _creatorRef not owned and not admin', (done) => {
    let user = _.clone(users[0]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = user._creatorRef;
    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(oldName);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should update user for _creatorRef not owned but admin', (done) => {
    let user = _.clone(users[1]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = user._creatorRef;
    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(newName);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(newName);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should return 401 if _creatorRef not found', (done) => {
    let user = _.clone(users[0]);
    let oldName = user.name;
    let newName = user.name + ' UPDATED';
    user.name = newName;
    let _creatorRef = new ObjectID();
    request(app)
      .patch('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .type('form')
      .send({
        user: JSON.stringify(user)
      })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe(CONSTS.AN_ERROR_OCURRED.error);
      })
      .end(done);
  });

});

describe('UPDATE /users/change-password', () => {

  it('should update password for logged in user if old and existing passwords match', (done) => {
    let user = _.clone(users[1]);
    let oldPassword = user.password;
    let newPassword = user.password + 'UPDATED';
    let token = user.tokens[0].token;
    let body = {
      oldPassword,
      newPassword
    };
    request(app)
      .patch('/users/change-password/')
      .set({
        'x-auth': token
      })
      .send(body)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(user.email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(token).then((dbUser) => {
          expect(dbUser.email).toBe(user.email);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not update password for user other than logged in user', (done) => {
    let user = _.clone(users[1]);
    let oldPassword = user.password;
    let newPassword = user.password + 'UPDATED';
    let token = user.tokens[0].token;
    let body = {
      oldPassword,
      newPassword
    };
    request(app)
      .patch('/users/change-password')
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send(body)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(token).then((dbUser) => {
          expect(dbUser.email).toBe(user.email);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not update password for logged in user if old and existing passwords don\'t match', (done) => {
    let user = _.clone(users[1]);
    let oldPassword = user.password + 'XXXXXXX';
    let newPassword = user.password + 'UPDATED';
    let token = user.tokens[0].token;
    let body = {
      oldPassword,
      newPassword
    };
    request(app)
      .patch('/users/change-password/')
      .set({
        'x-auth': user.tokens[0].token
      })
      .send(body)
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findByToken(token).then((dbUser) => {
          expect(dbUser.email).toBe(user.email);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/:_creatorRef', () => {

  it('should delete user if logged in as admin and user is not you', (done) => {
    let _creatorRef = users[1]._creatorRef;
    request(app)
      .delete('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(users[1].name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not delete user for id not owned and not admin', (done) => {
    let _creatorRef = users[0]._creatorRef;
    request(app)
      .delete('/users/' + _creatorRef)
      .set({
        'x-auth': users[1].tokens[0].token
      })
      .send()
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(users[0].name);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should not delete admin user', (done) => {
    let _creatorRef = users[0]._creatorRef;
    request(app)
      .delete('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send()
      .expect(401)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user.name).toBe(users[0].name);
          done();
        }).catch((e) => done(e));

      });
  });

  it('should delete user for id not owned but admin', (done) => {
    let _creatorRef = users[1]._creatorRef;
    request(app)
      .delete('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(users[1].name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({
          _creatorRef
        }).then((user) => {
          expect(user).toNotExist();
          done();
        }).catch((e) => done(e));

      });
  });

  it('should return 401 if _creatorRef found', (done) => {
    let _creatorRef = new ObjectID();
    request(app)
      .delete('/users/' + _creatorRef)
      .set({
        'x-auth': users[0].tokens[0].token
      })
      .send()
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe(CONSTS.AN_ERROR_OCURRED.error);
      })
      .end(done);
  });

});