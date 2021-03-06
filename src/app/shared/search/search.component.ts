import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
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
import { PhotoService } from "../../photos/photo.service";
import { Tag } from "../tags/tag.model";
import { Person } from "../people/person.model";
import { Photo } from "../../photos/photo.model";
import { AuthUserService } from "../../auth/auth-user.service";
import { Utils, LoglevelEnum, SortDataType } from "../../shared/utils/utils";
import { OrderByOption, OrderByDirectionEnum, OrderByDataTypeEnum } from "./order-by-option.model";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  search: Search;
  display = 'none';
  availableOrderByFields: OrderByOption[];

  myForm: FormGroup;

  public orderByDirectionEnumAsc:string = OrderByDirectionEnum.Ascending.toString();
  public orderByDirectionEnumDesc:string = OrderByDirectionEnum.Descending.toString();

  public selectedOrderByField: string;

  public selectedOrderByDirection: string;

  private showSearchSub: EventEmitter<Search>;
  private retSearchSub: EventEmitter<SearchRet>;
  private searchRet: SearchRet = new SearchRet();

  private hideMatchCriteriaText: String = "Hide Match Criteria";
  public showMatchCriteriaText: String = "Show Match Criteria";

  public toggleShowHideMatchCriteriaText = this.showMatchCriteriaText;


  getConsts() {
    return Consts;
  }

  toggleShowHideMatchCriteria() {
    if (this.toggleShowHideMatchCriteriaText === this.hideMatchCriteriaText) {
      this.toggleShowHideMatchCriteriaText = this.showMatchCriteriaText;
    } else {
      this.toggleShowHideMatchCriteriaText = this.hideMatchCriteriaText;
    }
  }

  private hideOrderByCriteriaText: String = "Hide Order By Fields";
  public showOrderByCriteriaText: String = "Show Order By Fields";
  public toggleShowHideOrderByCriteriaText = this.showOrderByCriteriaText;

  toggleShowHideOrderByCriteria() {
    if (this.toggleShowHideOrderByCriteriaText === this.hideOrderByCriteriaText) {
      this.toggleShowHideOrderByCriteriaText = this.showOrderByCriteriaText;
    } else {
      this.toggleShowHideOrderByCriteriaText = this.hideOrderByCriteriaText;
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



  onTagsChange() {
    //Utils.log(LoglevelEnum.Info,this,this.optionsModel);
  }

  onPeopleChange() {
    //Utils.log(LoglevelEnum.Info,this,this.optionsModel);
  }

  onPhotosChange() {
    //Utils.log(LoglevelEnum.Info,this,this.optionsModel);
  }


  isNotEmpty(val: any)  {
    return Utils.isNotEmpty(val);
  }


  constructor(private searchService: SearchService, private formBuilder: FormBuilder, private tagService: TagService
    , private personService: PersonService, private photoService: PhotoService, private authUserService: AuthUserService
  ) { }

  onClose() {
    this.display = 'none';
    this.searchRet.searchRetEnum = SearchRetEnum.Close;
    this.search.retSearchSub.emit(this.searchRet);
    this.reset();
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


  reset() {
    this.myForm.reset();
    this.tagService.selectedTags = [];
    this.personService.selectedPeople = [];
    this.photoService.selectedPhotos = [];
    this.myForm.get('from_date').setValue('1900-01-01');
    this.myForm.get('to_date').setValue(moment().format(Consts.DATE_DB_FORMAT));
    this.myForm.get('orderByDirection').setValue(this.orderByDirectionEnumAsc);
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

    if (this.isDirty(this.myForm.value.guestUser, 'guestUser')) {
      this.searchRet.searchElements.push({ name: 'guestUser', value: this.populate(this.myForm.value.guestUser), type: 'y_n_both' });
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

    if (this.isDirty(this.myForm.value.photos, 'photos')) {
      this.searchRet.searchElements.push({ name: 'medias', value: this.populate(this.myForm.value.photos), type: 'array' });
    };

    this.searchRet.caseSensitive = this.populate(this.myForm.value.caseSensitive);
    this.searchRet.matchAll = this.populate(this.myForm.value.matchAll);
    this.searchRet.matchCriteria = this.populate(this.myForm.value.matchCriteria * 1);


    this.searchRet.searchRetEnum = SearchRetEnum.ButtonOne;
    // add search criteria to searchRet, this may need to be onSubmit

    this.searchRet.orderByDirection = OrderByDirectionEnum[<string>this.myForm.value.orderByDirection];

    this.searchRet.orderByOption = this.availableOrderByFields.find(element => {
      //return element.field === this.selectedOrderByField;

      return element.field === this.myForm.value.orderByField;



    });

    this.search.retSearchSub.emit(this.searchRet);
    this.reset();

  }

  onCaseSensitive(event) {
    Utils.log(LoglevelEnum.Info, this, event);
  }

  onButtonTwo() {
    this.display = 'none';
    this.searchRet.searchRetEnum = SearchRetEnum.ButtonTwo;
    this.search.retSearchSub.emit(this.searchRet);
    this.reset();
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

    // if (searchComponent.authUserService.isLoggedIn()) {



    // searchComponent.tagService.getTags().subscribe(
    //   (tags: Tag[]) => {
    //     searchComponent.tagService.multiSelectTagOptions = [];
    //     for (let tag of tags) {
    //       searchComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
    //     };
    //     Utils.log(LoglevelEnum.Info,this,searchComponent.tagService.multiSelectTagOptions);
    //   }
    // );

    //   searchComponent.personService.getPeople().subscribe(
    //     (people: Person[]) => {
    //       searchComponent.personService.multiSelectPersonOptions = [];
    //       for (let person of people) {
    //         searchComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
    //       };
    //       Utils.log(LoglevelEnum.Info,this,searchComponent.personService.multiSelectPersonOptions);
    //     }
    //   );

    //   searchComponent.photoService.getPhotos().subscribe(
    //     (photos: Photo[]) => {
    //       searchComponent.photoService.multiSelectPhotoOptions = [];
    //       for (let photo of photos) {
    //         searchComponent.photoService.multiSelectPhotoOptions.push({ id: photo._id, name: photo.title });
    //       };
    //       Utils.log(LoglevelEnum.Info,this,searchComponent.photoService.multiSelectPhotoOptions);
    //     }
    //   );
    //};


    //this.selectedOrderByDirection = this.orderByDirectionEnumAsc;
    //this.myForm.get('orderByDirection').setValue(this.orderByDirectionEnumAsc);

    this.myForm = this.formBuilder.group({
      caseSensitive: new FormControl(null, null),
      matchAll: new FormControl('true', null),
      orderByField: new FormControl(null, null),
      orderByDirection: new FormControl(this.orderByDirectionEnumAsc, null),
      matchCriteria: new FormControl('Starts With', null),
      email: new FormControl(null, null),
      name: new FormControl(null, null),
      twitterId: new FormControl(null, null),
      facebookId: new FormControl(null, null),
      adminUser: new FormControl(null, null),
      guestUser: new FormControl(null, null),
      emailUpdates: new FormControl(null, null),
      relationship: new FormControl(null, null),
      title: new FormControl(null, null),
      description: new FormControl(null, null),
      tags: new FormControl(null, null),
      people: new FormControl(null, null),
      photos: new FormControl(null, null),
      from_date: new FormControl('1900-01-01', null),
      to_date: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
    });

    this.showSearchSub = this.searchService.showSearchSub
      .subscribe(
        (search: Search) => {
          this.reset();
          this.search = search;
          this.display = 'block';
          this.availableOrderByFields = search.orderByOptions;



          //this.selectedOrderByDirection = this.orderByDirectionEnumAsc;

          //this.myForm.value.orderByDirection.setValue(this.orderByDirectionEnumAsc);
          //this.myForm.get('orderByDirection').setValue(this.orderByDirectionEnumAsc);

          this.selectedOrderByDirection = this.orderByDirectionEnumAsc;

          search.orderByOptions.forEach((orderByField) => {
            if (orderByField.isDefault) {
              this.selectedOrderByField = orderByField.field;
            }
          })

          switch (this.search.searchType) {
            case SearchTypeEnum.Users:
              this.myForm = this.formBuilder.group({
                caseSensitive: new FormControl(null, null),
                matchAll: new FormControl('true', null),
                orderByField: new FormControl(this.selectedOrderByField, null),
                orderByDirection: new FormControl(this.selectedOrderByDirection, null),
                matchCriteria: new FormControl('Starts With', null),
                email: new FormControl(null, null),
                name: new FormControl(null, null),
                twitterId: new FormControl(null, null),
                facebookId: new FormControl(null, null),
                adminUser: new FormControl(null, null),
                guestUser: new FormControl(null, null),
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
                orderByField: new FormControl(this.selectedOrderByField, null),
                orderByDirection: new FormControl(this.selectedOrderByDirection, null),
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
              this.myForm = this.formBuilder.group({
                caseSensitive: new FormControl(null, null),
                matchAll: new FormControl('true', null),
                orderByField: new FormControl(this.selectedOrderByField, null),
                orderByDirection: new FormControl(this.selectedOrderByDirection, null),
                matchCriteria: new FormControl('Starts With', null),
                title: new FormControl(null, null),
                description: new FormControl(null, null),
                tags: new FormControl(null, null),
                people: new FormControl(null, null),
                photos: new FormControl(null, null),
                from_date: new FormControl('1900-01-01', null),
                to_date: new FormControl(moment().format(Consts.DATE_DB_FORMAT), null)
              });
              break;

          };
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