import { EventEmitter } from "@angular/core";
import { SearchRet } from "./search-ret.model";
import { SearchTypeEnum } from "./search-type.enum";
import { Search } from "./search.model";
import { OrderByOption } from "./order-by-option.model";

export class SearchService {
    search: Search;

    showSearchSub = new EventEmitter<Search>();

    showSearch(title: string
        , message: string
        , buttonOneTitle: string
        , buttonTwoTitle: string
        , retSearchSub: EventEmitter<SearchRet>
        , searchType : SearchTypeEnum
        , searchFields: String[]
        , orderByFields: OrderByOption[]) {

        const search = new Search(title, message, buttonOneTitle, buttonTwoTitle, retSearchSub,searchType,searchFields,orderByFields);
        this.showSearchSub.emit(search);
    }
}