import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';

import { ErrorService } from "../errors/error.service";
import { Tag } from "./tag.model";
import { Consts } from "../consts";

@Injectable()
export class TagService {
    public tags: Tag[] = [];
    constructor(private http: Http, private errorService: ErrorService) {
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
                        tag._id,
                        tag.tag);
                    transformedTags.push(newTag);
                };
                return transformedTags;
            }).catch((error: Response) => {
                tagService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }
}