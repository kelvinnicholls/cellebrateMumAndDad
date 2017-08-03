import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { SearchComponent } from "./search/search.component";
import { PasswordStrengthBarComponent } from './password-strength-bar/password-strength-bar.component';
import { ReversePipe } from "./pipes/reverse-pipe";
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { PaginationModule } from 'ngx-bootstrap';
import { NgbDateMomentParserFormatter } from './ngb-date-moment-parser-formatter';
import { Consts } from "./consts";

@NgModule({
    declarations: [
        SearchComponent,
        PasswordStrengthBarComponent,
        ReversePipe
    ],
    exports: [PasswordStrengthBarComponent,ReversePipe,SearchComponent,CommonModule,NgbModule,PaginationModule,FormsModule],
    imports: [CommonModule,ReactiveFormsModule,FormsModule,NgbModule.forRoot(),PaginationModule.forRoot()],
    providers: [{
        provide: NgbDateParserFormatter,
        useFactory: () => { return new NgbDateMomentParserFormatter(Consts.DATE_DISPLAY_FORMAT,Consts.DATE_DB_FORMAT) }
    }],
    bootstrap: []
})

export class SharedModule {

}