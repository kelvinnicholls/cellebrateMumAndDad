import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { ToastOptions } from 'ng2-toastr';

import { AppComponent } from "./app.component";
//https://www.npmjs.com/package/ng2-toastr
import {ToastModule} from 'ng2-toastr/ng2-toastr';
// https://www.npmjs.com/package/angular2-password-strength-bar
// import { PasswordStrengthBar } from 'angular2-password-strength-bar';
//import { DatepickerModule } from 'ngx-bootstrap/datepicker'
// http://valor-software.com/ngx-bootstrap/#/datepicker

import { HeaderComponent } from "./header.component";
import { routing } from "./app.routing";
import { UserComponent } from "./users/user.component";
import { UsersComponent } from "./users/users.component";
import { UserInputComponent } from "./users/user-input.component";
import { ChangePasswordComponent } from "./users/change-password/change-password.component";
import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { UserListComponent } from "./users/user-list.component";
import { SignInComponent } from "./auth/sign-in.component";
import { ErrorComponent } from "./errors/error.component";
import { GetEncryptedPasswordComponent } from "./auth/get-encrypted-password.component";
import { AuthService } from "./auth/auth.service";
import { UserService } from "./users/user.service";
import { ErrorService } from "./errors/error.service";
import { AppService } from "./app.service";
import { DropdownDirective } from './shared/dropdown.directive';
import { HomeComponent } from "./home.component";
import { AuthGuard } from './auth/auth-guard.service';
import { ToastCustomOption } from './shared/toast/toast-custom-option';
import { PasswordStrengthBarComponent } from './shared/password-strength-bar/password-strength-bar.component';


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SignInComponent,
        GetEncryptedPasswordComponent,
        UserComponent,
        UsersComponent,
        UserInputComponent,
        ChangePasswordComponent,
        UserListComponent,
        ErrorComponent,
        DropdownDirective,
        PageNotFoundComponent,
        HomeComponent,
        PasswordStrengthBarComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        routing,
        ReactiveFormsModule,
        HttpModule,
        ToastModule.forRoot()
    ],
    providers: [AuthService, UserService, ErrorService,AuthGuard,{provide: ToastOptions, useClass: ToastCustomOption},AppService],
    bootstrap: [AppComponent]
})
export class AppModule {

}