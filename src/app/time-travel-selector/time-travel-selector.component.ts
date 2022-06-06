import {AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigInterface, UtilsService} from '../core';

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import {isPlatformBrowser} from '@angular/common';
import {interval, Observable, Subject, takeUntil} from 'rxjs';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-time-travel-selector',
  templateUrl: './time-travel-selector.component.html',
  styleUrls: ['./time-travel-selector.component.scss'],
})
export class TimeTravelSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
  currentDate = new Date();
  isDark = new FormControl(true);
  private $destroy = new Subject();
  private config: ConfigInterface = {
    isRealTime: true,
    tillDate: this.utilsService.futureDateFromToday(0, 1).toISOString(),
    interval: 500,
  };
  private readonly interval?: Observable<number>;
  private root?: am5.Root;
  private chart?: am5xy.XYChart;
  private xAxis?: am5xy.DateAxis<am5xy.AxisRenderer>;
  private yAxis?: am5xy.ValueAxis<am5xy.AxisRenderer>;
  private data: any = [];
  private series?: am5xy.ColumnSeries;

  constructor(
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone
  ) {
    const routeData = route.snapshot.params['config'];
    if (routeData) {
      try {
        this.config = this.utilsService.decodeObjectToUri(routeData);
        this.interval = interval(5000);
      } catch (e) {
        alert('Internal server error. Please make the selection again');
        this.router.navigate(['/']).then();
      }
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.isDark.valueChanges.pipe(takeUntil(this.$destroy)).subscribe(() => this.setChartTheme());
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  setChartTheme(): void {
    if (this.root) {
      const theme = this.isDark.value
        ? [am5themes_Animated.new(this.root), am5themes_Dark.new(this.root)]
        : [am5themes_Animated.new(this.root)];
      this.root.setThemes(theme);
    }
  }

  initChart(): void {
    this.root = am5.Root.new('chartdiv');
    this.setChartTheme();
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        layout: this.root.verticalLayout,
      })
    );
  }

  loadData(): void {
    if (this.interval) {
      // this.interval.pipe(takeUntil(this.$destroy)).subscribe(() => {
      //   this.currentDate = new Date();
      //   // const test = [...new Array(this.utilsService.getRandomIntInclusive(0,1000))].map(() => {
      //   //   const random = Math.random();
      //   //     return {
      //   //       key: (random + 1).toString(36).substring(7),
      //   //       value: Math.round(random * 40),
      //   //       timestamp: + new Date()
      //   //     }
      //   //   })
      //   // console.log(test);
      // })
    }
    this.data = [
      {
        date: new Date(2021, 0, 1).getTime(),
        value: 100,
      },
      {
        date: new Date(2021, 0, 2).getTime(),
        value: 320,
      },
      {
        date: new Date(2021, 0, 3).getTime(),
        value: 216,
      },
      {
        date: new Date(2021, 0, 4).getTime(),
        value: 150,
      },
      {
        date: new Date(2021, 0, 5).getTime(),
        value: 156,
      },
      {
        date: new Date(2021, 0, 6).getTime(),
        value: 199,
      },
      {
        date: new Date(2021, 0, 7).getTime(),
        value: 114,
      },
      {
        date: new Date(2021, 0, 8).getTime(),
        value: 269,
      },
      {
        date: new Date(2021, 0, 9).getTime(),
        value: 90,
      },
      {
        date: new Date(2021, 0, 10).getTime(),
        value: 300,
      },
      {
        date: new Date(2021, 0, 11).getTime(),
        value: 150,
      },
      {
        date: new Date(2021, 0, 12).getTime(),
        value: 110,
      },
      {
        date: new Date(2021, 0, 13).getTime(),
        value: 185,
      },
      {
        date: new Date(2021, 0, 14).getTime(),
        value: 105,
      },
    ];
  }

  ngAfterViewInit() {
    this.generateGraph();
  }

  generateGraph(): void {
    this.browserOnly(() => {
      this.initChart();
      this.setCursor();
      this.setAxis();
      this.setSeries();
      this.addLegend();
      this.setScrollBar();
    });
  }

  setSeries(): void {
    // Create series
    if (this.chart && this.root && this.xAxis && this.yAxis) {
      this.series = this.chart.series.push(
        am5xy.ColumnSeries.new(this.root, {
          name: 'Series',
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          valueYField: 'value',
          valueXField: 'date',
          tooltip: am5.Tooltip.new(this.root, {
            labelText: '{valueY}',
          }),
        })
      );
    }
  }

  setAxis(): void {
    if (this.chart && this.root) {
      this.xAxis = this.chart.xAxes.push(
        am5xy.DateAxis.new(this.root, {
          maxDeviation: 0,
          baseInterval: {
            timeUnit: 'day',
            count: 1,
          },
          renderer: am5xy.AxisRendererX.new(this.root, {}),
          tooltip: am5.Tooltip.new(this.root, {}),
        })
      );

      this.yAxis = this.chart.yAxes.push(
        am5xy.ValueAxis.new(this.root, {
          renderer: am5xy.AxisRendererY.new(this.root, {}),
        })
      );

      // // Create Y-axis
      // this.yAxis = this.chart.yAxes.push(
      //   am5xy.ValueAxis.new(this.root, {
      //     renderer: am5xy.AxisRendererY.new(this.root, {})
      //   })
      // );
      //
      // // Create X-Axis
      // this.xAxis = this.chart.xAxes.push(
      //   am5xy.DateAxis.new(this.root, {
      //     baseInterval: {timeUnit: "millisecond", count: this.config.interval},
      //     renderer: am5xy.AxisRendererX.new(this.root, {})
      //   })
      // );
      // this.xAxis.data.setAll(this.data);
    }
  }

  setCursor(): void {
    if (this.root && this.chart) {
      const cursor = this.chart.set(
        'cursor',
        am5xy.XYCursor.new(this.root, {
          behavior: 'zoomX',
        })
      );
      cursor.lineY.set('visible', false);
    }
  }

  addLegend(): void {
    if (this.chart && this.root) {
      const legend = this.chart.children.push(am5.Legend.new(this.root, {}));
      legend.data.setAll(this.chart.series.values);
    }
  }

  setScrollBar(): void {
    if (this.chart && this.root) {
      this.chart.set('scrollbarX', am5.Scrollbar.new(this.root, {orientation: 'horizontal'}));
      this.chart.set('scrollbarY', am5.Scrollbar.new(this.root, {orientation: 'vertical'}));
    }
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.complete();
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }
}
