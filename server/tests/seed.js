const moment = require('moment');

const {
  ObjectID
} = require('mongodb');

const {
  Media
} = require('../models/media');

const {
  Comment
} = require('../models/comment');

const {
  Tag
} = require('../models/tag');

const {
  Person
} = require('../models/person');


const {
  Memory
} = require('../models/memory');

const {
  User,
  seed
} = require('../models/user');

const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user1CreatorRef = new ObjectID();
const user1email = "email1@email.com";
const user1password = "email1.password";

const user2Id = new ObjectID();
const user2CreatorRef = new ObjectID();
const user2email = "email2@email.com";
const user2password = "email2.password";

const mediaId1 = new ObjectID();
const mediaId2 = new ObjectID();

const memoryId1 = new ObjectID();
const memoryId2 = new ObjectID();

const commentId1 = new ObjectID();
const commentId2 = new ObjectID();

const tagId1 = new ObjectID();
const tagId2 = new ObjectID();
const tagId3 = new ObjectID();
const tagId4 = new ObjectID();

const personId1 = new ObjectID();
const personId2 = new ObjectID();
const personId3 = new ObjectID();
const personId4 = new ObjectID();


const md1 = new Date(moment('01/01/2016', 'DD/MM/YYYY').toISOString());
const md2 = new Date(moment('01/01/2017', 'DD/MM/YYYY').toISOString());

const kelvDob = new Date(moment('18/08/1964', 'DD/MM/YYYY').toISOString());
const sharonDob = new Date(moment('19/04/1966', 'DD/MM/YYYY').toISOString());


const tags = [{
  _id: tagId1,
  '_creator': user1CreatorRef,
  'tag': 'tag 1'
}, {
  _id: tagId2,
  '_creator': user2CreatorRef,
  'tag': 'tag 2'
}, {
  _id: tagId3,
  '_creator': user1CreatorRef,
  'tag': 'tag 3'
}, {
  _id: tagId4,
  '_creator': user2CreatorRef,
  'tag': 'tag 4'
}];

const people = [{
  _id: personId1,
  '_creator': user1CreatorRef,
  'person': 'person 1'
}, {
  _id: personId2,
  '_creator': user2CreatorRef,
  'person': 'person 2'
}, {
  _id: personId3,
  '_creator': user1CreatorRef,
  'person': 'person 3'
}, {
  _id: personId4,
  '_creator': user2CreatorRef,
  'person': 'person 4'
}];

const comments = [{
  _id: commentId1,
  'commentDate': new Date(),
  '_creator': user1CreatorRef,
  'comment': 'Comment 1'
}, {
  _id: commentId2,
  'commentDate': new Date(),
  '_creator': user2CreatorRef,
  'comment': 'Comment 2'
}];

const users = [{
    _id: user1Id,
    _creatorRef: user1CreatorRef,
    email: user1email,
    password: user1password,
    name: "Kelv",
    adminUser: true,
    guestUser: false,
    emailUpdates: true,
    relationship: "Son",
    _creator: user2CreatorRef,
    dob: kelvDob,
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: user1Id.toHexString(),
        access: 'auth'
      }, seed).toString()
    }]
  },
  {
    _id: user2Id,
    _creatorRef: user2CreatorRef,
    email: user2email,
    password: user2password,
    name: "Sharon",
    adminUser: false,
    guestUser: false,
    emailUpdates: false,
    relationship: "Daughter",
    _creator: user1CreatorRef,
    dob: sharonDob,
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: user2Id.toHexString(),
        access: 'auth'
      }, seed).toString()
    }]
  }
];

const medias = [{
  _id: mediaId1,
  location: "/media/media1.mpeg",
  isUrl: false,
  title: 'Media 1',
  isProfilePic: false,
  mimeType: "video/mpeg",
  description: "Movie 1",
  _creator: user1CreatorRef,
  mediaDate: md1,
  tags: [tagId1, tagId2],
  comments: [commentId1],
  people: [personId1, personId2]
}, {
  _id: mediaId2,
  location: "https://somesite/movie.mpeg",
  isUrl: true,
  title: 'Media 2',
  isProfilePic: false,
  description: "Url 1",
  _creator: user2CreatorRef,
  mediaDate: md2,
  tags: [tagId3, tagId4],
  comments: [commentId2],
  people: [personId3, personId4]
}];

const memories = [{
  _id: memoryId1,
  title: 'Memory 1',
  description: 'Memory 1',
  memoryDate: md1,
  _creator: user1CreatorRef,
  tags: [tagId3, tagId4],
  comments: [commentId1],
  people: [personId3, personId4],
  medias: [mediaId1]
}, {
  _id: memoryId2,
  title: 'Memory 2',
  description: 'Memory 2',
  memoryDate: md2,
  _creator: user2CreatorRef,
  tags: [tagId1, tagId2],
  comments: [commentId2],
  people: [personId1, personId2],
  medias: [mediaId2]
}];

const populateTags = (done) => {
  Tag.remove({}).then(() => {
    let tag1 = new Tag(tags[0]).save();
    let tag2 = new Tag(tags[1]).save();
    let tag3 = new Tag(tags[2]).save();
    let tag4 = new Tag(tags[3]).save();
    return Promise.all([tag1, tag2, tag3, tag4]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populateTags", err);
  });
};

const populatePeople = (done) => {
  Person.remove({}).then(() => {
    let person1 = new Person(people[0]).save();
    let person2 = new Person(people[1]).save();
    let person3 = new Person(people[2]).save();
    let person4 = new Person(people[3]).save();
    return Promise.all([person1, person2, person3, person4]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populatePeople", err);
  });
};


const populateComments = (done) => {
  Comment.remove({}).then(() => {
    let comment1 = new Comment(comments[0]).save();
    let comment2 = new Comment(comments[1]).save();
    return Promise.all([comment1, comment2]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populateComments", err);
  });
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    // return User.insertMany(users); // does not run mongoose middleware
    let user1 = new User(users[0]).save();
    let user2 = new User(users[1]).save();
    return Promise.all([user1, user2]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populateUsers", err);
  });
};

const populateMedias = (done) => {
  Media.remove({}).then(() => {
    // return User.insertMany(users); // does not run mongoose middleware
    let media1 = new Media(medias[0]).save();
    let media2 = new Media(medias[1]).save();
    return Promise.all([media1, media2]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populateMedias", err);
  });
};

const populateMemories = (done) => {
  Memory.remove({}).then(() => {
    // return User.insertMany(users); // does not run mongoose middleware
    let memory1 = new Memory(memories[0]).save();
    let memory2 = new Memory(memories[1]).save();
    return Promise.all([memory1, memory2]); // returns after both passed promises finish and calls middleware
  }).then(() => done()).catch((err) => {
    console.log("populateMemories", err);
  });
};


module.exports = {
  memories,
  medias,
  users,
  comments,
  tags,
  people,
  populateMemories,
  populateMedias,
  populateUsers,
  populateComments,
  populateTags,
  populatePeople
};
