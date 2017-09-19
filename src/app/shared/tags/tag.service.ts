import { Http, Response, Headers } from "@angular/http";
import { Subject } from 'rxjs/Subject';
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { IMultiSelectSettings, IMultiSelectTexts,IMultiSelectOption } from 'angular-2-dropdown-multiselect';

import { AppService } from "../../app.service";
import { ErrorService } from "../errors/error.service";
import { UserService } from "../../users/user.service";
import { Tag } from "./tag.model";
import { Consts } from "../consts";
import { Utils } from "../utils/utils";

@Injectable()
export class TagService {
    public tags: Tag[] = [];
    private socket;
    tagsChanged = new Subject<Tag[]>();


    tag: string = "tag";
    tagplural: string = this.tag + "'s";
    public selectedTags: string[] = [];


    public multiSelectSettings: IMultiSelectSettings = {
        enableSearch: true,
        //checkedStyle: 'fontawesome',
        //buttonClasses: 'btn btn-default btn-block',
        //dynamicTitleMaxItems: 3,
        //pullRight: true,
        showCheckAll: false,
        showUncheckAll: false,
        closeOnSelect: false
    };
  
    // Text configuration 
    public multiSelectTabsTexts: IMultiSelectTexts = {
        checkAll: 'Select all ' + this.tagplural,
        uncheckAll: 'Unselect all ' + this.tagplural,
        checked: this.tag + ' selected',
        checkedPlural: this.tagplural + '  selected',
        searchPlaceholder: 'Find ' + this.tag,
        defaultTitle: 'Select ' + this.tagplural,
        allSelected: 'All ' + this.tagplural + ' selected',
    };
  

    public multiSelectTagOptions: IMultiSelectOption[] = [
    ];



    constructor(private http: Http
        , private errorService: ErrorService
        , private userService: UserService
        , private appService: AppService) {
    }

    showTagSub = new EventEmitter<EventEmitter<Tag>>();

    showAddTag(retTagSub: EventEmitter<Tag>) {
        this.showTagSub.emit(retTagSub);
    }


    addCallbacks(socket: any) {
        this.socket = socket;

        this.socket.on('createdTag', (tag, changedBy) => {
            this.tags.push(tag);
            this.tagsChanged.next(this.tags);
            this.appService.showToast(Consts.INFO, "New tag  : " + tag.name + " added by " + changedBy);
            console.log(Consts.INFO, "New tag  : " + tag.name + " added by " + changedBy);
        });

    }

    tagExists(tag: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_TAGS_ROOT_TAG + '/' + tag.toLowerCase(), { headers: headers }).subscribe(
                (response: any) => {
                    let body = JSON.parse(response._body);
                    if (body.tagFound) {
                        resolve({ 'tagIsAlreadyUsed': true });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    addTag(tag: Tag) {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        const body = JSON.stringify(tag);

        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let tagService = this;
        return this.http.post(Consts.API_URL_TAGS_ROOT, body, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let tag = new Tag(result.tag, result._id, result._creator);
                tagService.tags.push(tag);

                this.socket.emit('tagCreated', tag, function (err) {
                    if (err) {
                        console.log("tagCreated err: ", err);
                    } else {
                        console.log("tagCreated No Error");
                    }
                });

                tagService.tagsChanged.next(tagService.tags);
                return tag;
            })
            .catch((error: Response) => {
                tagService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }


    public getTags(): Observable<any> {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let tagService = this;
        return this.http.get(Consts.API_URL_TAGS_ROOT, { headers: headers })
            .map((response: Response) => {
                let tags = response.json().tags;
                let transformedTags: Tag[] = [];
                for (let tag of tags) {
                    let newTag = new Tag(
                        tag.tag,
                        tag._id,
                        tag._creator);
                    transformedTags.push(newTag);
                };
                transformedTags.sort(Utils.dynamicSort('tag'));
                this.tags = transformedTags;
                return this.tags;
            }).catch((error: Response) => {
                tagService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }
}