import {AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigInterface, UtilsService} from "../core";

// amCharts imports
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import {isPlatformBrowser} from "@angular/common";
import {interval, Observable, Subject, takeUntil} from "rxjs";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-time-travel-selector',
  templateUrl: './time-travel-selector.component.html',
  styleUrls: ['./time-travel-selector.component.scss']
})
export class TimeTravelSelectorComponent implements OnInit, AfterViewInit, OnDestroy {

  private $destroy = new Subject();
  private config: ConfigInterface = {
    isRealTime: true,
    tillDate: this.utilsService.futureDateFromToday(0, 1).toISOString(),
    interval: 500
  }
  private readonly interval?: Observable<number>;
  private root?: am5.Root;
  private chart?: am5xy.XYChart;
  private xAxis?: am5xy.CategoryAxis<am5xy.AxisRenderer>
  private yAxis?: am5xy.ValueAxis<am5xy.AxisRenderer>
  private data: any = []
  private series?: am5xy.ColumnSeries
  currentDate = new Date();
  isDark = new FormControl(false)


  constructor(
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone) {
    const routeData = route.snapshot.params['config'];
    if (routeData) {
      try {
        this.config = this.utilsService.decodeObjectToUri(routeData)
        this.interval = interval(this.config.interval);
      } catch (e) {
        alert('Internal server error. Please make the selection again')
        this.router.navigate(['/']).then()
      }
    }
  }

  ngOnInit(): void {
    this.loadData()
    this.isDark.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res)=> {
      this.root?.setThemes([res? am5themes_Dark.new(this.root): am5themes_Animated.new(this.root)])
    })
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  initChart(): void {
    this.root = am5.Root.new("chartdiv");
    this.root.setThemes([am5themes_Animated.new(this.root)]);
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        layout: this.root.verticalLayout
      })
    );
  }

  loadData(): void {
    if (this.interval){
      this.interval.pipe(takeUntil(this.$destroy)).subscribe(()=> {
        this.currentDate = new Date();
      })
    }
    this.data = [
      {
        category: "Research",
        value1: 1000,
        value2: 588
      },
      {
        category: "Marketing",
        value1: 1200,
        value2: 1800
      },
      {
        category: "Sales",
        value1: 850,
        value2: 1230
      }
    ]
  }

  ngAfterViewInit() {
    this.generateGraph();
  }
  generateGraph():void {
    this.browserOnly(() => {
      this.initChart()
      this.setCursor()
      this.setAxis();
      this.setSeries()
      this.addLegend();
    });
  }

  setSeries(): void {
    // Create series
    if (this.chart && this.root && this.xAxis && this.yAxis) {
      this.series = this.chart.series.push(
        am5xy.ColumnSeries.new(this.root, {
          name: "Series",
          xAxis: this.xAxis,
          yAxis: this.yAxis,
          valueYField: "value1",
          categoryXField: "category"
        })
      );
      this.series.data.setAll(this.data);
    }

  }

  setAxis(): void {
    if (this.chart && this.root) {
      // Create Y-axis
      this.yAxis = this.chart.yAxes.push(
        am5xy.ValueAxis.new(this.root, {
          renderer: am5xy.AxisRendererY.new(this.root, {})
        })
      );

      // Create X-Axis
      this.xAxis = this.chart.xAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          renderer: am5xy.AxisRendererX.new(this.root, {}),
          categoryField: "category"
        })
      );
      this.xAxis.data.setAll(this.data);
    }
  }

  setCursor(): void {
    if (this.root && this.chart) {
      let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.root, {
        behavior: "zoomX"
      }));
      cursor.lineY.set("visible", false);
    }
  }

  addLegend(): void {
    if (this.chart && this.root) {
      let legend = this.chart.children.push(am5.Legend.new(this.root, {}));
      legend.data.setAll(this.chart.series.values);
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
