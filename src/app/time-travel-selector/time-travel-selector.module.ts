import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimeTravelSelectorComponent} from './time-travel-selector.component';
import {RouterModule, Routes} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {ReactiveFormsModule} from '@angular/forms';
import { NgxEchartsModule } from "ngx-echarts";
import * as echarts from 'echarts/core';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent, TitleComponent,
  ToolboxComponent,
  TooltipComponent
} from "echarts/components";
import { UniversalTransition } from "echarts/features";
import { BarChart, LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

const routes: Routes = [{path: '', component: TimeTravelSelectorComponent}];

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  UniversalTransition
]);

@NgModule({
  declarations: [TimeTravelSelectorComponent],
  imports: [
    RouterModule.forChild(routes),
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
})
export class TimeTravelSelectorModule {}
