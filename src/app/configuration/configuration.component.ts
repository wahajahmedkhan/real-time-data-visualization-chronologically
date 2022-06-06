import {Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigInterface, UtilsService} from '../core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent {
  minDate = this.utilsService.dateTimeLocal(new Date());
  intervalHint?: string | null;

  configFormGroup = new FormGroup({
    interval: new FormControl(0),
    isRealTime: new FormControl(false),
    tillDate: new FormControl(this.utilsService.dateTimeLocal(this.utilsService.futureDateFromToday(0, 0))),
  });

  constructor(private utilsService: UtilsService, private router: Router) {}

  get interval(): FormControl {
    return this.configFormGroup.get('interval') as FormControl;
  }

  get isRealTime(): FormControl {
    return this.configFormGroup.get('isRealTime') as FormControl;
  }

  formatLabel(value: number) {
    if (value >= 50) {
      return value / 1000 + 's';
    }
    return value;
  }

  generate(): void {
    const form = this.configFormGroup.value as ConfigInterface;
    if (form.interval == 0) {
      this.intervalHint = 'The interval must be greater then zero';
      return;
    }
    this.router.navigate(['/data/', this.utilsService.encodeObjectToUri(form)]).then();
  }

  reset(): void {
    this.configFormGroup.reset({
      interval: 0,
      isRealTime: false,
      tillDate: this.utilsService.dateTimeLocal(this.utilsService.futureDateFromToday(0, 0)),
    });
    this.minDate = this.utilsService.dateTimeLocal(new Date());
  }
}
