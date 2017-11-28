import { EventEmitter } from "@angular/core";
import * as moment from 'moment';
import { SearchRet } from "./search-ret.model";
import { SearchTypeEnum } from "./search-type.enum";
import { SearchMatchCriteriaEnum } from "./search-match-criteria.enum";
import { Consts } from "../../shared/consts";


export class Search {
  constructor(public title: string, public message: string, public buttonOneTitle: string, public buttonTwoTitle: string, public retSearchSub: EventEmitter<SearchRet>, public searchType: SearchTypeEnum, public searchFields: String[]) { }

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
      if (searchElement.value) {
        let elementName = searchElement.name;
        // if (searchElement.type === 'from') {
        //   elementName = String(searchElement.name).substr('from_'.length);
        // } else if (searchElement.type === 'to') {
        //   elementName = String(searchElement.name).substr('to_'.length);
        // };
        if (arrayElement[elementName]) {
          let attributeValue = arrayElement[elementName];
          let typeOfAttributeValue = typeof attributeValue;
          //console.log("attributeValue", attributeValue);
          //console.log("typeOfAttributeValue", typeOfAttributeValue);
          switch (typeOfAttributeValue) {
            case 'string':
              if (searchElement.type === 'y_n_both') {
                switch (searchElement.value) {
                  case 'Both':
                    matchingElementFound = true;
                    break;
                  case 'Yes':
                  case 'No':
                    if (attributeValue.toLowerCase() === searchElement.value.toLowerCase()) {
                      matchingElementFound = true;
                    } else {
                      nonMatchingElementFound = true;
                    };
                    break;
                };
              } else if (searchElement.type === 'array') {
                searchElement.value.forEach((element) => {
                  if (element === attributeValue) {
                    matchingElementFound = true;
                    return;
                  };
                });
                nonMatchingElementFound = !matchingElementFound;
              } else if (searchElement.type === 'from') {
                if (moment(searchElement.value, Consts.DATE_DB_FORMAT) <= moment(attributeValue, Consts.DATE_DB_FORMAT)) {
                  matchingElementFound = true;
                } else {
                  nonMatchingElementFound = true;
                }
              } else if (searchElement.type === 'to') {
                if (moment(searchElement.value, Consts.DATE_DB_FORMAT) >= moment(attributeValue, Consts.DATE_DB_FORMAT)) {
                  matchingElementFound = true;
                } else {
                  nonMatchingElementFound = true;
                }
              } else {
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
              break;
            case 'boolean':
              break;
            case 'object':
              if (Object.prototype.toString.call(arrayElement[elementName]) === "[object Array]") {
                if (searchElement.type === 'array') {
                  //console.log(attributeValue);
                  let matchingElementsCount = 0;
                  searchElement.value.forEach((searchElementValue) => {
                    attributeValue.forEach(attributeValueElement => {
                      if (searchElementValue === attributeValueElement) {
                        matchingElementsCount++;
                      };
                    });
                  });
                  if ((matchingElementsCount === searchElement.value.length && searchRet.matchAll) || (matchingElementsCount >0 && !searchRet.matchAll)) {
                    matchingElementFound = true;
                  };
                  nonMatchingElementFound = !matchingElementFound;
                };
              };
              break;
          }
          if (!searchRet.matchAll && matchingElementFound) {
            return;
          };
        };
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
