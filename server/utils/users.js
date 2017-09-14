//const _ = require('lodash');

class Users {
  constructor() {
    this.users = [];


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
