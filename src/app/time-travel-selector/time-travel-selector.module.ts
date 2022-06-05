import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimeTravelSelectorComponent} from './time-travel-selector.component';
import {RouterModule, Routes} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ReactiveFormsModule} from "@angular/forms";

const routes: Routes = [
  {path: '', component: TimeTravelSelectorComponent},
]

@NgModule({
  declarations: [
    TimeTravelSelectorComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ]
})
export class TimeTravelSelectorModule {
}
