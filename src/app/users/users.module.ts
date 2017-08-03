import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { UserComponent } from "./user.component";
import { UserInputComponent } from "./user-input.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { UserListComponent } from "./user-list.component";
import { usersRouting } from "./users.routing";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        UserComponent,
        UserInputComponent,
        ChangePasswordComponent,
        UserListComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        usersRouting,
        SharedModule
    ],
    providers: [],
    bootstrap: []
})
export class UsersModule {

}