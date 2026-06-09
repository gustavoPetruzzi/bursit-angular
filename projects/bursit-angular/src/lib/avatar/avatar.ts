import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'bursit-avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  host: {
    '[class.bursit-xs]': "this.size() === 'xs'",
    '[class.bursit-sm]': "this.size() === 'sm'",
    '[class.bursit-md]': "this.size() === 'md'",
    '[class.bursit-lg]': "this.size() === 'lg'",
    '[class.bursit-xl]': "this.size() === 'xl'",
    '[class.bursit-2xl]': "this.size() === '2xl'",
  },
})
export class Avatar {
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('sm');
  src = input<string | null>(null);
  userName = input<string>('No name');

  userInitials = computed(() => this.getInitials(this.userName()));

  private getInitials(username: string) {
    const initials = username
      .split(' ')
      .filter((name) => name.length > 0)
      .map((current, i, obj) => {
        if (i === 0 || i === obj.length - 1) {
          return current[0].toUpperCase();
        }
        return '';
      })
      .join('');

    return initials;
  }
}
