import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { EventEmitter } from "@angular/core";
import { Search } from "./search.model";
import { SearchRetEnum } from "./search-ret.enum";
import { SearchTypeEnum } from "./search-type.enum";
import { SearchRet } from "./search-ret.model";
import { SearchService } from "./search.service";



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
    return (val && this.myForm.controls[name] && this.myForm.controls[name].dirty);
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
      this.searchRet.searchElements.push({ name: 'relationship', value: this.populate(this.myForm.value.relationship), type: 'array'  });
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
  ngOnInit() {
    this.myForm = this.formBuilder.group({
      caseSensitive: new FormControl(null, null),
      matchAll: new FormControl(null, null),
      matchCriteria: new FormControl('Starts With', null),
      email: new FormControl(null, null),
      name: new FormControl(null, null),
      twitterId: new FormControl(null, null),
      facebookId: new FormControl(null, null),
      adminUser: new FormControl(null, null),
      relationship: new FormControl(null, null)
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
              matchAll: new FormControl(null, null),
              matchCriteria: new FormControl('Starts With', null),
              email: new FormControl(null, null),
              name: new FormControl(null, null),
              twitterId: new FormControl(null, null),
              facebookId: new FormControl(null, null),
              adminUser: new FormControl(null, null),
              relationship: new FormControl(null, null)
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