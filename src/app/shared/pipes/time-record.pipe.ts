import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeRecord',
  standalone: true
})
export class TimeRecordPipe implements PipeTransform {
  transform(value: number | null | undefined, mode?: string): string {
    if (value == null || isNaN(value)) {
      return '';
    }
    
    // If the mode is 'seconds', treat the value as a total seconds count.
    if (mode === 'seconds') {
      const totalSeconds = Math.floor(value); // force whole number
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();
      return `${minutes}m${formattedSeconds}s`;
    }
    
    // Otherwise, assume the input is in a minutes.seconds format (or whole number with last 2 digits as seconds)
    const strValue = value.toString();
    
    // If the input contains a dot, split into minutes and seconds parts.
    if (strValue.includes('.')) {
      const [minStr, secStr] = strValue.split('.');
      // Parse minutes to remove any decimals and convert back to string.
      const minutes = parseInt(minStr, 10).toString();
      // Pad the seconds part to at least 2 digits, then take only the first two characters,
      // and convert to integer to remove any extra decimals.
      const seconds = parseInt(secStr.padEnd(2, '0').substring(0, 2), 10);
      const secondsStr = seconds < 10 ? `0${seconds}` : seconds.toString();
      return `${minutes}m${secondsStr}s`;
    } else {
      // For whole numbers, assume the last two digits are seconds.
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
