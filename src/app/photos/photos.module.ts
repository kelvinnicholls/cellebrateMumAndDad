import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { PhotoInputComponent } from "./photo-input.component";
import { PhotoListComponent } from "./photo-list.component";
import { PhotoListItemComponent } from "./photo-list-item.component";
import { photosRouting } from "./photos.routing";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        PhotoInputComponent,
        PhotoListComponent,
        PhotoListItemComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        photosRouting,
        SharedModule
    ],
    providers: [],
    bootstrap: []
})
export class PhotosModule {

}