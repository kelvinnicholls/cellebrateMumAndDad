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

@NgModule({
    declarations: [
        SearchComponent,
        PasswordStrengthBarComponent,
        ReversePipe,
        ErrorComponent,
        DialogComponent,
        PageNotFoundComponent,
    ],
    exports: [PasswordStrengthBarComponent, ReversePipe, SearchComponent, CommonModule, NgbModule, PaginationModule, FormsModule,ErrorComponent,DialogComponent,PageNotFoundComponent],
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbModule.forRoot(), PaginationModule.forRoot(),sharedRouting],
    providers: [{
        provide: NgbDateParserFormatter,
        useFactory: () => { return new NgbDateMomentParserFormatter(Consts.DATE_DISPLAY_FORMAT, Consts.DATE_DB_FORMAT) }
    }],
    bootstrap: []
})

export class SharedModule {

}