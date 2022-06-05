import { Injectable } from '@angular/core';
import {ConfigInterface} from "../interfaces/config.interface";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  encodeObjectToUri(config: ConfigInterface):string {
    return encodeURIComponent(JSON.stringify(config));
  }

  decodeObjectToUri(encodedSting: string): ConfigInterface {
    return JSON.parse(decodeURIComponent(encodedSting))
  }
}
