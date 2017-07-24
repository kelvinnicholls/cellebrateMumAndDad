import { EventEmitter } from "@angular/core";
import { SearchRet } from "./search-ret.model";
import { SearchTypeEnum } from "./search-type.enum";
import { SearchMatchCriteriaEnum } from "./search-match-criteria.enum";


export class Search {
  constructor(public title: string, public message: string, public buttonOneTitle: string, public buttonTwoTitle: string, public retSearchSub: EventEmitter<SearchRet>, public searchType: SearchTypeEnum) { }

  static convertCase(val: String, convert: Boolean) {
    let retVal: String = val;
    if (convert) {
      retVal = retVal.toLowerCase();
    }
    return retVal;
  }

  static elementMatches(arrayElement: any, searchRet: SearchRet): Boolean {
    let retVal: Boolean = false;
    let matchingElementFound: Boolean = false;
    let nonMatchingElementFound: Boolean = false;
    searchRet.searchElements.forEach((searchElement) => {
      if (arrayElement[searchElement.name]) {
        let attributeValue = arrayElement[searchElement.name];
        if (typeof attributeValue === 'string') {
          switch (searchRet.matchCriteria) {
            case SearchMatchCriteriaEnum.Contains:
              if (this.convertCase(String(attributeValue), searchRet.caseSensitive).includes(this.convertCase(String(searchElement.value), searchRet.caseSensitive).toString())) {
                matchingElementFound = true;
              } else {
                nonMatchingElementFound = true;
              };
              break;
            case SearchMatchCriteriaEnum.Exact:
              if (this.convertCase(String(attributeValue), searchRet.caseSensitive) === this.convertCase(String(searchElement.value), searchRet.caseSensitive)) {
                matchingElementFound = true;
              } else {
                nonMatchingElementFound = true;
              };
              break;
            case SearchMatchCriteriaEnum.StartsWith:
              if (this.convertCase(String(attributeValue), searchRet.caseSensitive).startsWith(this.convertCase(String(searchElement.value), searchRet.caseSensitive).toString())) {
                matchingElementFound = true;
              } else {
                nonMatchingElementFound = true;
              };
              break;
          }
        };
      };
      if (!searchRet.matchAll && matchingElementFound) {
        return;
      };
    });

    if ((matchingElementFound && !searchRet.matchAll) || (matchingElementFound && !nonMatchingElementFound && searchRet.matchAll)) {
      retVal = true;
    }

    return retVal;
  }

  static restrict(array: any[], searchRet: SearchRet) {
    let retArray: any[] = [];
    array.forEach((element) => {
      if (this.elementMatches(element, searchRet)) {
        retArray.push(element);
      }
    });
    return retArray;
  }
}
