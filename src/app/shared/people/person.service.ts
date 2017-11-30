import { Http, Response, Headers } from "@angular/http";
import { Subject } from 'rxjs/Subject';
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { IMultiSelectTexts, IMultiSelectOption } from 'angular-2-dropdown-multiselect';

import { AppService } from "../../app.service";
import { ErrorService } from "../errors/error.service";
import { UserService } from "../../users/user.service";
import { Person } from "./person.model";
import { Consts } from "../consts";
import { Utils,LoglevelEnum } from "../utils/utils";
import { AuthUserService } from "../../auth/auth-user.service";

@Injectable()
export class PersonService {
    public people: Person[] = [];
    private socket;
    peopleChanged = new Subject<Person[]>();
    private retrievedPeople = false;
    
    person: string = "person";
    personplural: string = 'people';
    public selectedPeople: String[] = [];

    public multiSelectPeopleTexts: IMultiSelectTexts = {
        checkAll: 'Select all ' + this.personplural,
        uncheckAll: 'Unselect all ' + this.personplural,
        checked: this.person + ' selected',
        checkedPlural: this.personplural + '  selected',
        searchPlaceholder: 'Find ' + this.person,
        defaultTitle: 'Select ' + this.personplural,
        allSelected: 'All ' + this.personplural + ' selected',
    };

    public multiSelectPersonOptions: IMultiSelectOption[] = [
    ];


    constructor(private http: Http
        , private errorService: ErrorService
        , private userService: UserService
        , private authUserService: AuthUserService
        , private appService: AppService) {
        this.initialize();
    }

    async initialize() {
        this.getPeople();
    }

    public findPersonById(id: any): Person {
        return this.people.find((person) => {
            return person.id === id;
        });
    }


    public findPersonNameById(id: any): string {
        let personName = "";
        let person: Person = this.findPersonById(id);
        if (person) {
            personName = person.person;
        };
        return personName;
    }


    showPersonSub = new EventEmitter<EventEmitter<Person>>();

    showAddPerson(retPersonSub: EventEmitter<Person>) {
        this.showPersonSub.emit(retPersonSub);
    }


    addCallbacks(socket: any) {
        let personService = this;
        personService.socket = socket;

        personService.socket.on('createdPerson', (person, changedBy) => {
            personService.people.push(person);
            personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
            personService.peopleChanged.next(personService.people);
            personService.appService.showToast(Consts.INFO, "New person  : " + person.person + " added by " + changedBy);
            Utils.log(LoglevelEnum.Info,Consts.INFO, "New person  : " + person.person + " added by " + changedBy);
        });

    }

    personExists(person: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_PEOPLE_ROOT_PERSON + '/' + person.toLowerCase(), { headers: headers }).subscribe(
                (response: any) => {
                    let body = JSON.parse(response._body);
                    if (body.personFound) {
                        resolve({ 'personIsAlreadyUsed': true });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    addPerson(person: Person) {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        const body = JSON.stringify(person);

        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let personService = this;
        return this.http.post(Consts.API_URL_PEOPLE_ROOT, body, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let person = new Person(result.person, result._id, result._creator);
                personService.people.push(person);
                personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
                this.socket.emit('personCreated', person, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,"personCreated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,"personCreated No Error");
                    }
                });

                personService.peopleChanged.next(personService.people);
                return person;
            })
            .catch((error: Response) => {
                personService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }


    public getPeople(refresh: Boolean = false) {
        let personService = this;
        if ((!personService.retrievedPeople || refresh) && personService.authUserService.isLoggedIn()) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            let personService = this;
            this.http.get(Consts.API_URL_PEOPLE_ROOT, { headers: headers })
                .map((response: Response) => {
                    let people = response.json().people;
                    let transformedPersons: Person[] = [];
                    personService.multiSelectPersonOptions = [];
                    for (let person of people) {
                        let newPerson = new Person(
                            person.person,
                            person._id,
                            person._creator);
                        transformedPersons.push(newPerson);
                        personService.multiSelectPersonOptions.push({ id: person._id, name: person.person });
                    };
                    transformedPersons.sort(Utils.dynamicSort('person'));
                    this.people = transformedPersons;
                    personService.retrievedPeople = true;
                }).catch((error: Response) => {
                    personService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                }).subscribe();
        };
    };
}