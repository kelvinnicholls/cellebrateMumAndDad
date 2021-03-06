import { User } from "./user.model";

export class UserTestService {

    private static users: User[] = [];
    static getUsers() {
        if (UserTestService.users.length == 0) {
            UserTestService.initialize();
        };
        return UserTestService.users;
    }

    private static initialize() {
        for (var n = 1; n <= 10; n++) {

            let email: string = "email" + n + "@somewhere.com";
            let password: string = "password" + n;
            let name: string = "name" + n;
            let adminUser: boolean = true;
            let guestUser: boolean = true;
            let emailUpdates: boolean = false;
            let relationship: string = 'Son';
            let _creatorRef : string = '_creatorRef' + n;
            const user = new User(email, password, name, adminUser, guestUser, emailUpdates, relationship, null, null, null, _creatorRef);
            UserTestService.users.push(user);
        }
    }
}
