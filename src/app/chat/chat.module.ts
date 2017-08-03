import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { chatRouting } from "./chat.routing";


@NgModule({
    declarations: [
        
    ],
    exports: [],
    imports: [CommonModule,
        ReactiveFormsModule,
        chatRouting],
    providers: [],
    bootstrap: []
})

export class ChatModule {

}