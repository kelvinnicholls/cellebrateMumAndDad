//const _ = require('lodash');

class Users {
  constructor() {
    this.users = [];

    // let user1 = {'id': 1,'name': "Kelvin"};
    // let user2 = {'id': 2,'name': "Sharon"};
    // let user3 = {'id': 3, 'name': "Geoffrey"};
    // this.users.push(user1);
    // this.users.push(user2);
    // this.users.push(user3);
  }
  addUser(id, name) {
    let user = {
      id,
      name
    };
    this.users.push(user);
    return user;
  }

  removeUser(id) {
    // user = getUser(id);
    // users = _.remove(users, function (user) {
    //     return user.id !== id;
    // });
    // return user; {}
    let user = this.getUser(id);
    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return user;
  }

  getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
    // index = _.findIndex(users, ['id', id]);
    // return users[index];
  }


  getUserList() {
    return this.users;
  }
}

module.exports = {
  Users
};
