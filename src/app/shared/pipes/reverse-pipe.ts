import {PipeTransform, Pipe} from '@angular/core';


@Pipe({name: 'reverseArray',pure : false})
export class ReversePipe implements PipeTransform {

  transform(input: any): any
  {

    return Array.isArray(input)
      ? input.reverse()
      : input;
  }
}