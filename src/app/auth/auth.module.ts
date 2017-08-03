import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { SignInComponent } from "./sign-in.component";
import { GetEncryptedPasswordComponent } from "./get-encrypted-password.component";
import { authRouting } from "./auth.routing";


@NgModule({
    declarations: [
        SignInComponent,
        GetEncryptedPasswordComponent,
    ],
    exports: [],
    imports: [CommonModule,
        ReactiveFormsModule,
        authRouting],
    providers: [],
    bootstrap: []
})

export class AuthModule {

}