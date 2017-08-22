import { Component, Input } from '@angular/core';
import { CommentDisplay } from "../comment.model";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent {


  @Input() commentDisplay: CommentDisplay;



}
