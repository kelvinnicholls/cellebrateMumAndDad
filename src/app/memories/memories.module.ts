import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { MemoryComponent } from "./memory.component";
import { MemoryInputComponent } from "./memory-input.component";
import { MemoryListComponent } from "./memory-list.component";
import { memoriesRouting } from "./memories.routing";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    declarations: [
        MemoryComponent,
        MemoryInputComponent,
        MemoryListComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        memoriesRouting,
        SharedModule
    ],
    providers: [],
    bootstrap: []
})
export class MemoriesModule {

}