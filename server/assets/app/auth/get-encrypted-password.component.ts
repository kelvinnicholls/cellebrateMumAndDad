import { Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";


import { AuthService } from "./auth.service";

@Component({
    selector: 'get-encrypted-password',
    templateUrl: './get-encrypted-password.component.html'
})
export class GetEncryptedPasswordComponent {
    myForm: FormGroup;
    hashedPassword: String = "";
    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        this.authService.getEncryptedPassword(this.myForm.value.password)
            .subscribe(
            data => {
                this.hashedPassword = "Encrypted Password : " + data.hash;
            },
            error => console.error(error)
            );
        //this.myForm.reset();
    }

    ngOnInit() {
        this.myForm = new FormGroup({
            password: new FormControl(null, Validators.required)
        });
    }

}