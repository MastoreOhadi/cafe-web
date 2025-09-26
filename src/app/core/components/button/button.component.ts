import {
  Component,
  Input,
  HostBinding,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'dbutton, button[dbutton], a[dbutton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (loading) {
      <span class="icon-loader-circle animate-spin"></span>
    }
    <ng-content></ng-content>
  `,
  host: {
    class: `
      inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium
      transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50
      [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none
      focus-visible:ring-2 focus-visible:ring-blue-500
      select-none cursor-pointer
    `
  }
})
export class DButton {
  @Input() type: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() shape: 'default' | 'circle' | 'square' = 'default';
  @Input() full = false;
  @Input() loading = false;
  @Input() class = '';

  @HostBinding('class')
  get hostClasses(): string {
    return [
      this.getTypeClasses(),
      this.getSizeClasses(),
      this.getShapeClasses(),
      this.full ? 'w-full' : '',
      this.loading ? 'opacity-50 pointer-events-none' : '',
      this.class
    ].filter(Boolean).join(' ');
  }

  private getTypeClasses(): string {
    const classes = {
      default: '', //'bg-blue-600 text-white shadow-xs hover:bg-blue-700',
      destructive: 'bg-red-600 text-white shadow-xs hover:bg-red-700',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white',
      link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400'
    } as const;

    return classes[this.type] || classes.default;
  }

  private getSizeClasses(): string {
    const classes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3 gap-1.5',
      lg: 'h-10 px-6',
      icon: 'size-9'
    } as const;

    return classes[this.size] || classes.default;
  }

  private getShapeClasses(): string {
    const classes = {
      default: 'rounded-md',
      circle: 'rounded-full',
      square: 'rounded-none'
    } as const;

    return classes[this.shape] || classes.default;
  }
}