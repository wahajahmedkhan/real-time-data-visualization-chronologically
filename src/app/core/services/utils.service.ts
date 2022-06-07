import {Injectable} from '@angular/core';
import {ConfigInterface} from '../interfaces/config.interface';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  encodeObjectToUri(config: ConfigInterface): string {
    return encodeURIComponent(window.btoa(JSON.stringify(config)));
  }

  decodeObjectToUri(encodedSting: string): ConfigInterface {
    return JSON.parse(window.atob(decodeURIComponent(encodedSting)));
  }

  futureDateFromToday(addYears = 0, addMonths = 0, addDays = 0, addHours = 0, addMinutes = 0, addSeconds = 0): Date {
    const now = new Date();
    now.setFullYear(now.getFullYear() + addYears, now.getMonth() + addMonths);
    const minutesInSecond = addMinutes * 60;
    const hourInSecond = addHours * 60 * 60;
    const dayInSecond = addDays * 24 * 60 * 60;
    now.setSeconds(now.getSeconds() + addSeconds + minutesInSecond + hourInSecond + dayInSecond);
    return now;
  }

  dateTimeLocal(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)}-${
      date.getDate() >= 10 ? date.getDate() : '0' + date.getDate()
    }T${date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()}:${
      date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
    }:${date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds()}`;
  }

}
