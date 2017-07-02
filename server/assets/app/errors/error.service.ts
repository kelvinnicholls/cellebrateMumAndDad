import { EventEmitter } from "@angular/core";

import { Error } from "./error.model";

export class ErrorService {
    errorOccurred = new EventEmitter<Error>();

    handleError(error: any) {
        let title = "Error";
        let message = "";
        if (error.title) {
            title = error.title;
        };
        if (error.error) {
            message = error.error;
        };

        const errorData = new Error(title, message);
        this.errorOccurred.emit(errorData);
    }
}