import { Http, Response, Headers } from "@angular/http";
import { Subject } from 'rxjs/Subject';
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { IMultiSelectTexts, IMultiSelectOption } from 'angular-2-dropdown-multiselect';

import { AppService } from "../../app.service";
import { ErrorService } from "../errors/error.service";
import { UserService } from "../../users/user.service";
import { Tag } from "./tag.model";
import { Consts } from "../consts";
import { Utils,LoglevelEnum } from "../utils/utils";
import { AuthUserService } from "../../auth/auth-user.service";


@Injectable()
export class TagService {
    public tags: Tag[] = [];
    private socket;
    tagsChanged = new Subject<Tag[]>();
    private retrievedTags = false;


    tag: string = "tag";
    tagplural: string = this.tag + "'s";
    public selectedTags: String[] = [];

    public findTagById(id: any): Tag {
        return this.tags.find((tag) => {
            return tag.id === id;
        });
    }


    public findTagNameById(id: any): string {
        let tagName = "";
        let tag: Tag = this.findTagById(id);
        if (tag) {
            tagName = tag.tag;
        };
        return tagName;
    }


    // Text configuration 
    public multiSelectTagsTexts: IMultiSelectTexts = {
        checkAll: 'Select all ' + this.tagplural,
        uncheckAll: 'Unselect all ' + this.tagplural,
        checked: this.tag + ' selected',
        checkedPlural: this.tagplural + '  selected',
        searchPlaceholder: 'Find ' + this.tag,
        defaultTitle: this.tagplural,
        allSelected: 'All ' + this.tagplural + ' selected',
    };


    public multiSelectTagOptions: IMultiSelectOption[] = [
    ];



    constructor(private http: Http
        , private errorService: ErrorService
        , private userService: UserService
        , private authUserService: AuthUserService
        , private appService: AppService) {
    }


    initialize(): Promise<any> {
        return this.getTags().toPromise();
    }



    showTagSub = new EventEmitter<EventEmitter<Tag>>();

    showAddTag(retTagSub: EventEmitter<Tag>) {
        this.showTagSub.emit(retTagSub);
    }


    addCallbacks(socket: any) {
        let tagService = this;
        tagService.socket = socket;

        tagService.socket.on('createdTag', (tag, changedBy) => {
            tagService.tags.push(tag);
            tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
            tagService.sortTags();
            tagService.tagsChanged.next(this.tags);
            tagService.appService.showToast(Consts.INFO, "New tag  : " + tag.tag + " added by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "New tag  : " + tag.tag + " added by " + changedBy);
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
                tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
                tagService.sortTags();
                this.socket.emit('tagCreated', tag, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"tagCreated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"tagCreated No Error");
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


    sortTags() {
        let tagService = this;
        tagService.multiSelectTagOptions = tagService.multiSelectTagOptions.slice();
        tagService.multiSelectTagOptions = tagService.multiSelectTagOptions.sort(Utils.dynamicSort('name'));

        tagService.tags = tagService.tags.slice();
        tagService.tags = tagService.tags.sort(Utils.dynamicSort('tag'));

    }

    public getTags(refresh: Boolean = false) {
        let tagService = this;
        if ((!tagService.retrievedTags || refresh) && tagService.authUserService.isLoggedIn()) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            return this.http.get(Consts.API_URL_TAGS_ROOT, { headers: headers })
                .map((response: Response) => {
                    let tags = response.json().tags;
                    let transformedTags: Tag[] = [];
                    tagService.multiSelectTagOptions = [];
                    for (let tag of tags) {
                        let newTag = new Tag(
                            tag.tag,
                            tag._id,
                            tag._creator);
                        transformedTags.push(newTag);
                        tagService.multiSelectTagOptions.push({ id: tag._id, name: tag.tag }); 
                    };
                    tagService.tags = transformedTags;
                    tagService.sortTags();
                    tagService.retrievedTags = true;
                    return tagService.tags;
                }).catch((error: Response) => {
                    tagService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        };
    };
}