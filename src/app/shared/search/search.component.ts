import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventEmitter } from "@angular/core";
import { Search } from "./search.model";
import { SearchRetEnum } from "./search-ret.enum";
import { SearchService } from "./search.service";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  search: Search;
  display = 'none';
  private showSearchSub: EventEmitter<Search>;
  private retSearchSub: EventEmitter<SearchRetEnum>;

  constructor(private searchService: SearchService) { }

  onClose() {
    this.display = 'none';
    this.search.retSearchSub.emit(SearchRetEnum.Close);
  }

  onButtonOne() {
    this.display = 'none';
    this.search.retSearchSub.emit(SearchRetEnum.ButtonOne);
  }

  onButtonTwo() {
    this.display = 'none';
    this.search.retSearchSub.emit(SearchRetEnum.ButtonTwo);
  }

  ngOnInit() {
    this.showSearchSub = this.searchService.showSearchSub
      .subscribe(
      (search: Search) => {
        this.search = search;
        this.display = 'block';
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