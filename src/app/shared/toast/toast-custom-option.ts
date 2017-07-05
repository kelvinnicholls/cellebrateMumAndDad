import {ToastOptions} from 'ng2-toastr';

export class ToastCustomOption extends ToastOptions {
  animate = 'flyRight'; // you can override any options available
  newestOnTop = false;
  showCloseButton = true;
  positionClass = 'toast-top-center';
  //dismiss = 'click';
}