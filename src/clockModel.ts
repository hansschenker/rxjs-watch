import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ClockState {
  seconds: number;
  minutes: number;
  hours: number;
}

export const clockModel$: Observable<ClockState> = interval(1000).pipe(
  map(() => {
    const now = new Date();
    return {
      seconds: now.getSeconds(),
      minutes: now.getMinutes(),
      hours: now.getHours() % 12 // Convert to 12-hour format
    };
  })
);
