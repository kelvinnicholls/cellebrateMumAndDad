import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { ToastOptions } from 'ng2-toastr';
import { PaginationModule } from 'ngx-bootstrap';
import { AppComponent } from "./app.component";
//https://www.npmjs.com/package/ng2-toastr
import { ToastModule } from 'ng2-toastr/ng2-toastr';
// https://www.npmjs.com/package/angular2-password-strength-bar
// import { PasswordStrengthBar } from 'angular2-password-strength-bar';
//import { DatepickerModule } from 'ngx-bootstrap/datepicker'
// http://valor-software.com/ngx-bootstrap/#/datepicker

// https://github.com/danrevah/ngx-pipes#reverse-1
import {NgPipesModule} from 'ngx-pipes';

import { HeaderComponent } from "./header.component";
import { routing } from "./app.routing";
import { UserComponent } from "./users/user.component";
import { UserInputComponent } from "./users/user-input.component";
import { ChangePasswordComponent } from "./users/change-password/change-password.component";
import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { UserListComponent } from "./users/user-list.component";
import { SignInComponent } from "./auth/sign-in.component";
import { ErrorComponent } from "./errors/error.component";
import { DialogComponent } from "./dialog/dialog.component";
import { SearchComponent } from "./shared/search/search.component";
import { GetEncryptedPasswordComponent } from "./auth/get-encrypted-password.component";
import { AuthService } from "./auth/auth.service";
import { AuthUserService } from "./auth/auth-user.service";
import { UserService } from "./users/user.service";
import { ErrorService } from "./errors/error.service";
import { DialogService } from "./dialog/dialog.service";
import { SearchService } from "./shared/search/search.service";
import { ChatService } from "./chat/chat.service";
import { ChatUsersComponent } from "./chat/chat-users/chat-users.component";
import { ChatMessagesListComponent } from "./chat/chat-messages-list/chat-messages-list.component";
import { ChatMessageComponent } from "./chat/chat-messages-list/chat-message/chat-message.component";
import { ChatSendMessageComponent } from "./chat/chat-send-message/chat-send-message.component";
import { ReversePipe } from "./shared/pipes/reverse-pipe";

import { AppService } from "./app.service";
import { HomeComponent } from "./home.component";
import { AuthGuard } from './auth/auth-guard.service';
import { ToastCustomOption } from './shared/toast/toast-custom-option';
import { PasswordStrengthBarComponent } from './shared/password-strength-bar/password-strength-bar.component';
//https://www.npmjs.com/package/angular2-tooltip
//import {ToolTipModule} from 'angular2-tooltip'
//https://ng-bootstrap.github.io/#/getting-started
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SignInComponent,
        GetEncryptedPasswordComponent,
        UserComponent,
        UserInputComponent,
        ChangePasswordComponent,
        UserListComponent,
        ErrorComponent,
        PageNotFoundComponent,
        HomeComponent,
        PasswordStrengthBarComponent,
        DialogComponent,
        ChatUsersComponent,
        ChatMessagesListComponent,
        ChatMessageComponent,
        ChatSendMessageComponent,
        SearchComponent,
        ReversePipe
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        routing,
        ReactiveFormsModule,
        HttpModule,
        ToastModule.forRoot(),
        NgbModule.forRoot(),
        PaginationModule.forRoot(),
        NgPipesModule
    ],
    providers: [AuthService, UserService, ErrorService, AuthGuard, { provide: ToastOptions, useClass: ToastCustomOption }, AppService, DialogService,ChatService,AuthUserService,SearchService],
    bootstrap: [AppComponent]
})
export class AppModule {

}