let expect = require('expect');

const {
    Users
} = require('../utils/users');

let users;

beforeEach(() => {
    users = new Users();

    users.users = [{
            id: "1",
            name: "Mike"
        },
        {
            id: "2",
            name: "Julie"
        },
        {
            id: "3",
            name: "Steve"
        }
    ]
});

describe('Users', () => {
    it('should add new user', () => {
        let users = new Users();
        let user = {
            id: "123",
            name: "Kelv"
        };
        let resUser = users.addUser(user.id, user.name);
        expect(users.users.length).toEqual(4);
    });

    it('should return all names', () => {
        let userList = users.getUserList();
        expect(userList).toEqual(users.users);
    });



    it('should remove a user', () => {
        let user = users.removeUser("1");
        expect(users.users.length).toBe(2);
        expect(user).toEqual({
            id: "1",
            name: "Mike"
        });
    });

    it('should not remove a user', () => {
        let user = users.removeUser("4");
        expect(users.users.length).toBe(3);
        expect(user).toBe(undefined);
        expect(user).toNotExist();
    });

    it('should find a user', () => {
        let user = users.getUser("1");
        expect(user).toEqual({
            id: "1",
            name: "Mike"
        });
        expect(users.users.length).toBe(3);
    });

    it('should not find a user', () => {
        let user = users.getUser("4");
        expect(user).toBe(undefined);
        expect(user).toNotExist();
        expect(users.users.length).toBe(3);
    });
});