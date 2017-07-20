import { EventEmitter } from "@angular/core";
import { SearchRetEnum } from "./search-ret.enum";

export class Search {
    constructor(public title: string, public message: string, public buttonOneTitle: string, public buttonTwoTitle: string,public retSearchSub: EventEmitter<SearchRetEnum>) { }
}
