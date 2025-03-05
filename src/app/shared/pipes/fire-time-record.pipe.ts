import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fireTimeRecord',
  standalone: true
})
export class FireTimeRecordPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) {
      return '';
    }
    
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    return `${minutes}m${formattedSeconds}s`;
  }
}
