import { Component, Input } from '@angular/core';
import { CommentDisplay } from "../comment.model";

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.css']
})
export class CommentListComponent  {

  @Input() comments : CommentDisplay[] = [];

}
