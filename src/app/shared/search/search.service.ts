import { EventEmitter } from "@angular/core";
import { SearchRetEnum } from "./search-ret.enum";
import { Search } from "./search.model";

export class SearchService {
    search: Search;

    showSearchSub = new EventEmitter<Search>();

    showSearch(title: string, message: string, buttonOneTitle: string, buttonTwoTitle: string, retSearchSub: EventEmitter<SearchRetEnum>) {

        const search = new Search(title, message, buttonOneTitle, buttonTwoTitle, retSearchSub);
        this.showSearchSub.emit(search);
    }
}