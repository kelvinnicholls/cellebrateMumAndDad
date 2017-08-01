import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import * as moment from 'moment';
import { EventEmitter } from "@angular/core";
import { Search } from "./search.model";
import { SearchRetEnum } from "./search-ret.enum";
import { SearchTypeEnum } from "./search-type.enum";
import { SearchRet } from "./search-ret.model";
import { SearchService } from "./search.service";
import { Consts } from "../../shared/consts";



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  search: Search;
  display = 'none';
  myForm: FormGroup;
  private showSearchSub: EventEmitter<Search>;
  private retSearchSub: EventEmitter<SearchRet>;
  private searchRet: SearchRet = new SearchRet();

  private hideMatchCriteriaText: String = "Hide Match Criteria";
  public showMatchCriteriaText: String = "Show Match Criteria";
  public toggleShowHideMatchCriteriaText = this.showMatchCriteriaText;

  toggleShowHideMatchCriteria() {
    if (this.toggleShowHideMatchCriteriaText === this.hideMatchCriteriaText) {
      this.toggleShowHideMatchCriteriaText = this.showMatchCriteriaText;
    } else {
      this.toggleShowHideMatchCriteriaText = this.hideMatchCriteriaText;
    }
  }

  private hideSearchFieldsText: String = "Hide Search Fields";
  public showSearchFieldsText: String = "Show Search Fields";
  public toggleShowHideSearchFieldsText = this.hideSearchFieldsText;

  toggleShowHideSearchFields() {
    if (this.toggleShowHideSearchFieldsText === this.hideSearchFieldsText) {
      this.toggleShowHideSearchFieldsText = this.showSearchFieldsText;
    } else {
      this.toggleShowHideSearchFieldsText = this.hideSearchFieldsText;
    }
  }


  constructor(private searchService: SearchService, private formBuilder: FormBuilder) { }

  onClose() {
    this.display = 'none';
    this.searchRet.searchRetEnum = SearchRetEnum.Close;
    this.search.retSearchSub.emit(this.searchRet);
  }

  populate(source: any): any {
    if (source) {
      return source;
    } else {
      return null;
    }
  }

  isDirty(val: string, name: string) {
    return (val && val.length > 0 && this.myForm.controls[name] && this.myForm.controls[name].dirty);
  }


  onSubmit() {
    this.display = 'none';

    if (this.isDirty(this.myForm.value.email, 'email')) {
      this.searchRet.searchElements.push({ name: 'email', value: this.populate(this.myForm.value.email) });
    };

    if (this.isDirty(this.myForm.value.name, 'name')) {
      this.searchRet.searchElements.push({ name: 'name', value: this.populate(this.myForm.value.name) });
    };


    if (this.isDirty(this.myForm.value.adminUser, 'adminUser')) {
      this.searchRet.searchElements.push({ name: 'adminUser', value: this.populate(this.myForm.value.adminUser), type: 'y_n_both' });
    };

    if (this.isDirty(this.myForm.value.twitterId, 'twitterId')) {
      this.searchRet.searchElements.push({ name: 'twitterId', value: this.populate(this.myForm.value.twitterId) });
    };

    if (this.isDirty(this.myForm.value.facebookId, 'facebookId')) {
      this.searchRet.searchElements.push({ name: 'facebookId', value: this.populate(this.myForm.value.facebookId) });
    };

    if (this.isDirty(this.myForm.value.relationship, 'relationship')) {
      this.searchRet.searchElements.push({ name: 'relationship', value: this.populate(this.myForm.value.relationship), type: 'array' });
    };

    if (this.isDirty(this.myForm.value.from_dob, 'from_dob')) {
      this.searchRet.searchElements.push({ name: 'from_dob', value: this.populate(this.myForm.value.from_dob), type: 'from' });
    };

    if (this.isDirty(this.myForm.value.to_dob, 'to_dob')) {
      this.searchRet.searchElements.push({ name: 'to_dob', value: this.populate(this.myForm.value.to_dob), type: 'to' });
    };

    this.searchRet.caseSensitive = this.populate(this.myForm.value.caseSensitive);
    this.searchRet.matchAll = this.populate(this.myForm.value.matchAll);
    this.searchRet.matchCriteria = this.populate(this.myForm.value.matchCriteria * 1);


    this.searchRet.searchRetEnum = SearchRetEnum.ButtonOne;
    // add search criteria to searchRet, this may need to be onSubmit
    this.search.retSearchSub.emit(this.searchRet);
  }

  onCaseSensitive(event) {
    console.log(event);
  }

  onButtonTwo() {
    this.display = 'none';
    this.searchRet.searchRetEnum = SearchRetEnum.ButtonTwo;
    this.search.retSearchSub.emit(this.searchRet);
  }

  isFormValid() {
    return this.myForm.valid && this.myForm.dirty;
  }

  //https://blog.johanneshoppe.de/2016/10/angular-2-how-to-use-date-input-controls-with-angular-forms/

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      caseSensitive: new FormControl(null, null),
      matchAll: new FormControl('true', null),
      matchCriteria: new FormControl('Starts With', null),
      email: new FormControl(null, null),
      name: new FormControl(null, null),
      twitterId: new FormControl(null, null),
      facebookId: new FormControl(null, null),
      adminUser: new FormControl(null, null),
      relationship: new FormControl(null, null),
      from_dob: new FormControl('1900-01-01', null),
      to_dob: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
    });

    this.showSearchSub = this.searchService.showSearchSub
      .subscribe(
      (search: Search) => {
        this.search = search;
        this.display = 'block';
        switch (this.search.searchType) {
          case SearchTypeEnum.Users:
            this.myForm = this.formBuilder.group({
              caseSensitive: new FormControl(null, null),
              matchAll: new FormControl('true', null),
              matchCriteria: new FormControl('Starts With', null),
              email: new FormControl(null, null),
              name: new FormControl(null, null),
              twitterId: new FormControl(null, null),
              facebookId: new FormControl(null, null),
              adminUser: new FormControl(null, null),
              relationship: new FormControl(null, null),
              from_dob: new FormControl('1900-01-01', null),
              to_dob: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
            });
            break;
          case SearchTypeEnum.Photos:
            break;
          case SearchTypeEnum.Memories:
            break;

        }
        this.searchRet = new SearchRet();
      }
      );
    
  }

  destroy(sub: any) {
    if (sub) {
      sub.unsubscribe();
      sub = null;
    }
  }

  ngOnDestroy() {
    this.destroy(this.showSearchSub);
    this.destroy(this.retSearchSub);
  }
}