import { Person } from "./person.model";
export class PersonTestService {

    private static people : Person[] = [];
    static getPeople() {
        if (PersonTestService.people.length == 0) {
            PersonTestService.initialize();
        };
        return PersonTestService.people;
    }

    private static initialize() {
        for (var n = 1; n <= 10; n++) {
            let personName: string = "person " + n ;
            let _id: string = "_id" + n;
            let _creator: string = "_creator" + n;

            const person = new Person(
                personName,
                _id,
                _creator);

            PersonTestService.people.push(person);
        }
    }
}
