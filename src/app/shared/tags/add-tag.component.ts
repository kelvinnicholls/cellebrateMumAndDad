import { Component, OnInit, OnDestroy, ViewContainerRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { ToastService } from "../toast/toast.service";
import { TagService } from "./tag.service";
import { Tag } from "./tag.model";

import { DialogRetEnum } from "../dialog/dialog-ret.enum";
import { Dialog } from "../dialog/dialog.model";
import { DialogService } from "../dialog/dialog.service";

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.css'],
  providers: [ToastService]
})
export class AddTagComponent implements OnInit {

  display = 'none';
  myForm: FormGroup;
  private showTagSub: EventEmitter<EventEmitter<Tag>>;
  private retTagSub: EventEmitter<Tag>;
  private tag: Tag;


  constructor(private tagService: TagService
    , private toastService: ToastService
    , private dialogService: DialogService
    , private vcr: ViewContainerRef
    , private formBuilder: FormBuilder) {
    toastService.toast.setRootViewContainerRef(vcr);
  }

  onClose() {
    this.display = 'none';
    this.tag = null;
    this.retTagSub.emit(this.tag);
    this.reset();
  }

  reset() {
    this.myForm.reset();
    this.myForm.get('autoSelect').setValue(true);
  }

  isDirty(val: string, name: string) {
    return (val && val.length > 0 && this.myForm.controls[name] && this.myForm.controls[name].dirty);
  }


  forbiddenTags = (control: FormControl): Promise<any> | Observable<any> => {
    return this.tagService.tagExists(control.value);
  }

  onSubmit() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();
    let addTagComponent = this;

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {



          addTagComponent.tag = new Tag(addTagComponent.myForm.value.tag, null, null, addTagComponent.myForm.value.autoSelect);
          let autoSelect: boolean = addTagComponent.myForm.value.autoSelect;

          addTagComponent.tagService.addTag(addTagComponent.tag)
            .subscribe(
            data => {
              addTagComponent.toastService.showSuccess("Tag created.");
              addTagComponent.tag = new Tag(data.tag, data.id, data._creator, autoSelect);
              addTagComponent.retTagSub.emit(addTagComponent.tag);
            },
            error => {
              console.error("TagComponent tagService.newTag error", error);
              addTagComponent.tag = null;
              addTagComponent.retTagSub.emit(addTagComponent.tag);
            }
            );

          addTagComponent.reset();
        } else {
          addTagComponent.display = 'block';
        };
      });

    addTagComponent.display = 'none';
    addTagComponent.dialogService.showDialog("Warning", "Do you really wish to add this tag?", "Yes", "No", retDialogSub);
  }


  isFormValid() {
    return this.myForm.valid && this.myForm.dirty;
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      tag: new FormControl(null, Validators.required, this.forbiddenTags),
      autoSelect: new FormControl('false', null)
    });

    this.showTagSub = this.tagService.showTagSub
      .subscribe(
      (retTagSub: EventEmitter<Tag>) => {
        this.display = 'block';
        this.retTagSub = retTagSub;
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
    this.destroy(this.showTagSub);
    this.destroy(this.retTagSub);
  }
}