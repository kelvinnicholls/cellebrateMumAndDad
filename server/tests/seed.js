const moment = require('moment');

const {
    ObjectID
} = require('mongodb');

const {
    Media
} = require('../models/media');

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

const md1 = new Date(moment('01/01/2016', 'DD/MM/YYYY').toISOString());
const md2 = new Date(moment('01/01/2017', 'DD/MM/YYYY').toISOString());
const kelvDob = new Date(moment('18/08/1964', 'DD/MM/YYYY').toISOString());
const sharonDob = new Date(moment('19/04/1966', 'DD/MM/YYYY').toISOString());


const users = [{
        _id: user1Id,
        _creatorRef : user1CreatorRef,
        email: user1email,
        password: user1password,
        name: "Kelv",
        adminUser: true,
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
         _creatorRef : user2CreatorRef,
        email: user2email,
        password: user2password,
        name: "Sharon",
        adminUser: false,
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
    mimeType: "video/mpeg",
    description: "Movie 1",
    _creator: user1CreatorRef,
    mediaDate: md1,
    tags: ["tag1", "tag2"],
    users: [users[0]._creatorRef, users[1]._creatorRef]
}, {
    _id: mediaId2,
    location: "https://somesite/movie.mpeg",
    isUrl: true,
    title: 'Media 2',
    description: "Url 1",
    _creator: user2CreatorRef,
    mediaDate: md2,
    tags: ["tag3", "tag4"],
    users: [users[0]._creatorRef, users[1]._creatorRef]
}];

const memories = [{
    _id: memoryId1,
    title: 'Memory 1',
    description: 'Memory 1',
    memoryDate: md1,
    _creator: user1CreatorRef,
    tags: ["tag1", "tag4"],
    users: [users[0]._creatorRef, users[1]._creatorRef],
    medias: [mediaId1]
}, {
    _id: memoryId2,
    title: 'Memory 2',
    description: 'Memory 2',
    memoryDate: md2,
    _creator: user2CreatorRef,
    tags: ["tag2", "tag3"],
    users: [users[0]._creatorRef, users[1]._creatorRef],
    medias: [mediaId2]
}];


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
    populateMemories,
    populateMedias,
    populateUsers
};