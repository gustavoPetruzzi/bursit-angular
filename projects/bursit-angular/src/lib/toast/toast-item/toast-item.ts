import { Component, computed, input, output } from "@angular/core";
import { BursitIconComponent } from "../../icon/icon";
@Component({
    selector: 'bursit-toast-item',
    templateUrl: './toast-item.html',
    styleUrls: ['./toast-item.scss'],
    standalone: true,
    host: {
      '[class.bursit-toast--success]': "this.type() === 'success'",
      '[class.bursit-toast--info]': "this.type() === 'info'",
      '[class.bursit-toast--warning]': "this.type() === 'warning'",
      '[class.bursit-toast--error]': "this.type() === 'error'",
      '[attr.role]': 'this.role()'
    },
    imports: [BursitIconComponent]
})
export class ToastItemComponent {
    message = input();
    type = input<'success' | 'info' | 'warning' | 'error'>('success');
    showCloseButton = input<boolean>(true);
    role = computed(() => this.type() === 'success' || this.type() === 'info' ? 'status' : 'alert');
    close = output<void>();
}
