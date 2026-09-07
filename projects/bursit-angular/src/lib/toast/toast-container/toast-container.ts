import { Component, computed, inject, input } from "@angular/core";
import { ToastRef } from "../toast-ref";
import { ToastPosition } from "../toast.types";
import { ToastService } from "../toast.service";
import { ToastItemComponent } from "../toast-item/toast-item";

@Component({
  selector: 'bursit-toast-container',
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.scss'],
  standalone: true,
  imports: [ToastItemComponent],
})
export class ToastContainerComponent {
  position = input.required<ToastPosition>();
  private _service = inject(ToastService);
  toasts = computed(() => this._service.toastsForPosition(this.position()));

  dismiss(toast: ToastRef) {
    toast.dismiss();
  }

  pause(toast: ToastRef) {
    this._service.pauseToast(toast);
  }

  resume(toast: ToastRef) {
    this._service.resumeToast(toast);
  }
}
