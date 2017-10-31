import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";


import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { ErrorComponent } from "./errors/error.component";
import { DialogComponent } from "./dialog/dialog.component";
import { SearchComponent } from "./search/search.component";
import { PasswordStrengthBarComponent } from './password-strength-bar/password-strength-bar.component';
import { ReversePipe } from "./pipes/reverse-pipe";
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { PaginationModule } from 'ngx-bootstrap';
import { NgbDateMomentParserFormatter } from './ngb-date-moment-parser-formatter';
import { Consts } from "./consts";
import { sharedRouting } from "./shared.routing";
import { SignInComponent } from "./sign-in/sign-in.component";
import { CommentAddComponent } from "./comments/comment-add/comment-add.component";
import { CommentComponent } from "./comments/comment/comment.component";
import { CommentListComponent } from "./comments/comments-list/comments-list.component";
import { AddTagComponent } from "./tags/add-tag.component";
import { AddPersonComponent } from "./people/add-person.component";

import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { NgxGalleryModule } from 'ngx-gallery';

@NgModule({
    declarations: [
        SearchComponent,
        PasswordStrengthBarComponent,
        ReversePipe,
        ErrorComponent,
        DialogComponent,
        PageNotFoundComponent,
        SignInComponent,
        CommentAddComponent,
        CommentComponent,
        CommentListComponent,
        AddTagComponent,
        AddPersonComponent
        
    ],
    exports: [NgxGalleryModule,MultiselectDropdownModule,AddPersonComponent,AddTagComponent,CommentAddComponent, CommentComponent, CommentListComponent, PasswordStrengthBarComponent, ReversePipe, SearchComponent, CommonModule, NgbModule, PaginationModule, FormsModule, ErrorComponent, DialogComponent, PageNotFoundComponent],
    imports: [NgxGalleryModule,MultiselectDropdownModule,CommonModule, ReactiveFormsModule, FormsModule, NgbModule.forRoot(), PaginationModule.forRoot(), sharedRouting],
    providers: [{
        provide: NgbDateParserFormatter,
        useFactory: () => { return new NgbDateMomentParserFormatter(Consts.DATE_DISPLAY_FORMAT, Consts.DATE_DB_FORMAT) }
    }],
    bootstrap: []
})

export class SharedModule {

}