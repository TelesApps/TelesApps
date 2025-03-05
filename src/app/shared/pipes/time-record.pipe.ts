import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRecord',
  standalone: true
})
export class TimeRecordPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) {
      return '';
    }
    
    const strValue = value.toString();
    
    // If input contains a dot, assume it's in minutes.seconds format
    if (strValue.includes('.')) {
      const [minutes, rawSeconds] = strValue.split('.');
      // Ensure seconds are always two digits
      let seconds = rawSeconds.padEnd(2, '0').substring(0, 2);
      return `${minutes}m${seconds}s`;
    } else {
      // For whole numbers, the last two digits are seconds
      const len = strValue.length;
      let minutes: string;
      let seconds: string;
      
      if (len <= 2) {
        minutes = '0';
        seconds = strValue.padStart(2, '0');
      } else {
        minutes = strValue.substring(0, len - 2);
        seconds = strValue.substring(len - 2);
      }
      
      return `${minutes}m${seconds}s`;
    }
  }
}
