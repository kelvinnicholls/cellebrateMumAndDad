import { Component, OnInit, OnDestroy, ViewContainerRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { ToastService } from "../toast/toast.service";
import { PersonService } from "./person.service";
import { Person } from "./person.model";
import { Consts } from "../consts";
import { DialogRetEnum } from "../dialog/dialog-ret.enum";
import { Dialog } from "../dialog/dialog.model";
import { DialogService } from "../dialog/dialog.service";

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.css'],
  providers: [ToastService]
})
export class AddPersonComponent implements OnInit {

  display = 'none';
  myForm: FormGroup;
  private showPersonSub: EventEmitter<EventEmitter<Person>>;
  private retPersonSub: EventEmitter<Person>;
  private person: Person;


  constructor(private personService: PersonService
    , private toastService: ToastService
    , private dialogService: DialogService
    , private vcr: ViewContainerRef
    , private formBuilder: FormBuilder) {
    toastService.toast.setRootViewContainerRef(vcr);
  }

  onClose() {
    this.display = 'none';
    this.person = null;
    this.retPersonSub.emit(this.person);
    this.reset();
  }


  reset() {
    this.myForm.reset();
    this.myForm.get('autoSelect').setValue(true);
  }


  isDirty(val: string, name: string) {
    return (val && val.length > 0 && this.myForm.controls[name] && this.myForm.controls[name].dirty);
  }


  forbiddenPeople = (control: FormControl): Promise<any> | Observable<any> => {
    return this.personService.personExists(control.value);
  }

  onSubmit() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();
    let addPersonComponent = this;

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {



          addPersonComponent.person = new Person(addPersonComponent.myForm.value.person, null, null, addPersonComponent.myForm.value.autoSelect);
          let autoSelect: boolean = addPersonComponent.myForm.value.autoSelect;

          addPersonComponent.personService.addPerson(addPersonComponent.person)
            .subscribe(
            data => {
              addPersonComponent.toastService.showSuccess("Person created.");
              addPersonComponent.person = new Person(data.person, data.id, data._creator, autoSelect);
              addPersonComponent.retPersonSub.emit(addPersonComponent.person);
            },
            error => {
              console.error("PersonComponent personService.newPerson error", error);
              addPersonComponent.person = null;
              addPersonComponent.retPersonSub.emit(addPersonComponent.person);
            }
            );

            addPersonComponent.reset();
        } else {
          addPersonComponent.display = 'block';
        };
      });

    addPersonComponent.display = 'none';
    addPersonComponent.dialogService.showDialog("Warning", "Do you really wish to add this person?", "Yes", "No", retDialogSub);
  }


  isFormValid() {
    return this.myForm.valid && this.myForm.dirty;
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      person: new FormControl(null, [Validators.required,Validators.pattern(Consts.ALPHANUMERIC_PATTERN)], this.forbiddenPeople),
      autoSelect: new FormControl('false', null)
    });

    this.showPersonSub = this.personService.showPersonSub
      .subscribe(
      (retPersonSub: EventEmitter<Person>) => {
        this.display = 'block';
        this.retPersonSub = retPersonSub;
      }
      );

  }

  destroy(sub: any) {
    if (sub) {
      sub.unsubscribe();
      sub = null;
    }
  }

  ngOnDestroy() {
    this.destroy(this.showPersonSub);
    this.destroy(this.retPersonSub);
  }
}