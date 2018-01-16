import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { UserInputComponent } from "./user-input.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { UserListComponent } from "./user-list.component";
import { usersRouting } from "./users.routing";
import { SharedModule } from "../shared/shared.module";
import { UserListItemComponent } from "./user-list-item.component";

@NgModule({
    declarations: [
        UserInputComponent,
        ChangePasswordComponent,
        UserListComponent,
        UserListItemComponent
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