import { Injectable } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";

@Injectable()
export class PasswordValidationService {
    constructor() { }

    static matchingPasswords = (oldPasswordKey: string, newPasswordKey: string) => {
        return (group: FormGroup): { [key: string]: any } => {
            let oldPassword = group.controls[oldPasswordKey];
            let newPassword = group.controls[newPasswordKey];

            if (oldPassword.value && newPassword.value && oldPassword.value === newPassword.value) {
                return {
                    matchingPasswords: true
                };
            }
        }
    };

    static oneUppercase = (c: FormControl) => {
        let password = c.value;
        if (password && password.toLowerCase() === password) {
            return {
                oneUppercase: true
            };
        } else {
            return null;
        }
    };

    static oneLowercase = (c: FormControl) => {
        let password = c.value;
        if (password && password.toUpperCase() === password) {
            return {
                oneLowercase: true
            };
        } else {
            return null;
        }
    };
}
