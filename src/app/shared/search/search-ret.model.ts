import { EventEmitter } from "@angular/core";
import { SearchRetEnum } from "./search-ret.enum";
import { SearchMatchCriteriaEnum } from "./search-match-criteria.enum";

export class SearchRet {
    public searchElements: any[] = [];
    private _caseSensitive: Boolean = false;
    private _matchAll: Boolean = false;
    private _matchCriteria: SearchMatchCriteriaEnum = SearchMatchCriteriaEnum.StartsWith;
    private static lineBreak: string = "<br />";

    public getSearchCriteria() {
        let retVal: string = "";
        retVal += this._caseSensitive ? "Case <strong>sensitive</strong>" : "Case <strong>insensitive</strong>";
        retVal += SearchRet.lineBreak;
        retVal += this._matchAll ? "Match <strong>all fields</strong>" : "Match <strong>any field</strong>";
        retVal += SearchRet.lineBreak;
        retVal += "Match Criteria: <strong>" + this._matchCriteria.toString() + "</strong>";
        retVal += SearchRet.lineBreak;
        this.searchElements.forEach((element) => {
            if (element.value) {
                retVal += element.name + " : <strong>'" + element.value + "'</strong>";
                retVal += SearchRet.lineBreak;
            };
        });
        return retVal;
    }

    get matchAll(): Boolean {
        return this._matchAll;
    }
    set matchAll(matchAll: Boolean) {
        if (matchAll === null || matchAll === undefined) {
            this._matchAll = false;
        } else {
            this._matchAll = matchAll;
        }

    }

    get caseSensitive(): Boolean {
        return this._caseSensitive;
    }
    set caseSensitive(caseSensitive: Boolean) {
        if (caseSensitive === null || caseSensitive === undefined) {
            this._caseSensitive = false;
        } else {
            this._caseSensitive = caseSensitive;
        }

    }

    get matchCriteria(): SearchMatchCriteriaEnum {
        return this._matchCriteria;
    }
    set matchCriteria(matchCriteria: SearchMatchCriteriaEnum) {
        if (matchCriteria === null || matchCriteria === undefined) {
            this._matchCriteria = SearchMatchCriteriaEnum.StartsWith;
        } else {
            this._matchCriteria = matchCriteria;
        }

    }

    public searchRetEnum: SearchRetEnum;
    constructor() { }
}
