import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { IMultiSelectSettings, IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import * as moment from 'moment';
import { EventEmitter } from "@angular/core";
import { Search } from "./search.model";
import { SearchRetEnum } from "./search-ret.enum";
import { SearchTypeEnum } from "./search-type.enum";
import { SearchRet } from "./search-ret.model";
import { SearchService } from "./search.service";
import { Consts } from "../../shared/consts";
import { TagService } from "../tags/tag.service";
import { PersonService } from "../people/person.service";
import { Tag } from "../tags/tag.model";
import { Person } from "../people/person.model";

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

  multiSelectSettings: IMultiSelectSettings = {
    enableSearch: true,
    //checkedStyle: 'fontawesome',
    //buttonClasses: 'btn btn-default btn-block',
    //dynamicTitleMaxItems: 3,
    //pullRight: true,
    showCheckAll: false,
    showUncheckAll: false,
    closeOnSelect: false
  };

  onTagsChange() {
    //console.log(this.optionsModel);
  }

  onPeopleChange() {
    //console.log(this.optionsModel);
  }

  constructor(private searchService: SearchService, private formBuilder: FormBuilder, private tagService: TagService
    , private personService: PersonService
  ) { }

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
    if (!this.canShow(name)) {
      return false;
    } else {
      return (val && val.length > 0 && this.myForm.controls[name] && this.myForm.controls[name].dirty);
    };
  }

  getDateField(): string {
    let retField = "";

    if (this.search.searchType === SearchTypeEnum.Users) {
      retField = 'dob';
    } else if (this.search.searchType === SearchTypeEnum.Photos) {
      retField = 'mediaDate';
    } else if (this.search.searchType === SearchTypeEnum.Memories) {
      retField = 'memoryDate';
    };

    return retField;
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

    if (this.isDirty(this.myForm.value.emailUpdates, 'emailUpdates')) {
      this.searchRet.searchElements.push({ name: 'emailUpdates', value: this.populate(this.myForm.value.emailUpdates), type: 'y_n_both' });
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

    if (this.isDirty(this.myForm.value.from_date, 'from_date')) {
      this.searchRet.searchElements.push({ name: this.getDateField(), value: this.populate(this.myForm.value.from_date), type: 'from' });
    };

    if (this.isDirty(this.myForm.value.to_date, 'to_date')) {
      this.searchRet.searchElements.push({ name: this.getDateField(), value: this.populate(this.myForm.value.to_date), type: 'to' });
    };

    if (this.isDirty(this.myForm.value.title, 'title')) {
      this.searchRet.searchElements.push({ name: 'title', value: this.populate(this.myForm.value.title) });
    };

    if (this.isDirty(this.myForm.value.description, 'description')) {
      this.searchRet.searchElements.push({ name: 'description', value: this.populate(this.myForm.value.description) });
    };

    if (this.isDirty(this.myForm.value.tags, 'tags')) {
      this.searchRet.searchElements.push({ name: 'tags', value: this.populate(this.myForm.value.tags), type: 'array' });
    };

    if (this.isDirty(this.myForm.value.people, 'people')) {
      this.searchRet.searchElements.push({ name: 'people', value: this.populate(this.myForm.value.people), type: 'array' });
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

  canShow(field: string): boolean {
    let retVal: boolean = false;

    if (this.search && this.search.searchFields && this.search.searchFields.indexOf(field) > -1) {
      retVal = true;
    };

    return retVal;
  }

  //https://blog.johanneshoppe.de/2016/10/angular-2-how-to-use-date-input-controls-with-angular-forms/

  ngOnInit() {

    let searchComponent = this;

    searchComponent.tagService.getTags().subscribe(
      (tags: Tag[]) => {
        searchComponent.tagService.multiSelectTagOptions = [];
        for (let tag of tags) {
          searchComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
        };
        console.log(searchComponent.tagService.multiSelectTagOptions);
      }
    );

    searchComponent.personService.getPeople().subscribe(
      (people: Person[]) => {
        searchComponent.personService.multiSelectPersonOptions = [];
        for (let person of people) {
          searchComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
        };
        console.log(searchComponent.personService.multiSelectPersonOptions);
      }
    );


    this.myForm = this.formBuilder.group({
      caseSensitive: new FormControl(null, null),
      matchAll: new FormControl('true', null),
      matchCriteria: new FormControl('Starts With', null),
      email: new FormControl(null, null),
      name: new FormControl(null, null),
      twitterId: new FormControl(null, null),
      facebookId: new FormControl(null, null),
      adminUser: new FormControl(null, null),
      emailUpdates: new FormControl(null, null),
      relationship: new FormControl(null, null),
      title: new FormControl(null, null),
      description: new FormControl(null, null),
      tags: new FormControl(null, null),
      people: new FormControl(null, null),
      from_date: new FormControl('1900-01-01', null),
      to_date: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
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
              emailUpdates: new FormControl(null, null),
              relationship: new FormControl(null, null),
              from_date: new FormControl('1900-01-01', null),
              to_date: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
            });
            break;
          case SearchTypeEnum.Photos:
            this.myForm = this.formBuilder.group({
              caseSensitive: new FormControl(null, null),
              matchAll: new FormControl('true', null),
              matchCriteria: new FormControl('Starts With', null),
              title: new FormControl(null, null),
              description: new FormControl(null, null),
              tags: new FormControl(null, null),
              people: new FormControl(null, null),
              from_date: new FormControl('1900-01-01', null),
              to_date: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
            });
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