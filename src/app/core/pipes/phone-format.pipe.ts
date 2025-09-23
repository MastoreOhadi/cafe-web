import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'phoneFormat',
   standalone: true,
})
export class PhoneFormatPipe implements PipeTransform {
   transform(value: string | null | undefined): string {
      if (!value) return '';

      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11) return value;

      return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
   };
};
