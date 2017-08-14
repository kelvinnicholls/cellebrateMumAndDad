import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { PhotoComponent } from "./photo.component";
import { PhotoInputComponent } from "./photo-input.component";
import { PhotoListComponent } from "./photo-list.component";
import { photosRouting } from "./photos.routing";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        PhotoComponent,
        PhotoInputComponent,
        PhotoListComponent
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