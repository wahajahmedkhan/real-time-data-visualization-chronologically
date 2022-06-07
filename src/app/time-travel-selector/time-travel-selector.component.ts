import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfigInterface, PollInterface, UtilsService } from "../core";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { isPlatformBrowser } from "@angular/common";
import { interval, Observable, Subject, takeUntil } from "rxjs";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-time-travel-selector",
  templateUrl: "./time-travel-selector.component.html",
  styleUrls: ["./time-travel-selector.component.scss"]
})
export class TimeTravelSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
  currentDate = new Date();
  isDark = new FormControl(true);
  lastWorker = 0;
  private $destroy = new Subject();
  private config: ConfigInterface = {
    isRealTime: true,
    tillDate: this.utilsService.futureDateFromToday(0, 1).toISOString(),
    interval: 500
  };
  private readonly interval?: Observable<number>;
  private root?: am5.Root;
  private chart?: am5xy.XYChart;
  private xAxis?: am5xy.DateAxis<am5xy.AxisRenderer>;
  private yAxis?: am5xy.ValueAxis<am5xy.AxisRenderer>;
  private series?: am5xy.ColumnSeries;
  private workers?: Record<number, Worker>;
  easing = am5.ease.linear;
  isPlaying = true;


  constructor(
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private zone: NgZone,
    private changeDetectorRef:ChangeDetectorRef
  ) {
    const routeData = route.snapshot.params["config"];
    if (routeData) {
      try {
        this.config = this.utilsService.decodeObjectToUri(routeData);
        this.interval = interval(this.config.interval);
      } catch (e) {
        alert("Internal server error. Please make the selection again");
        this.router.navigate(["/"]).then();
      }
    }
  }

  ngOnInit(): void {
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
    this.root = am5.Root.new("chartdiv");
    this.setChartTheme();
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        focusable: true,
        wheelY: "zoomX",
        layout: this.root.verticalLayout
      })
    );
  }
  initWorker():void {
    if (typeof Worker !== "undefined") {
      this.workers = {
        0: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), {type:'module'}),
        1: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), {type:'module'}),
        2: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), {type:'module'}),
      };
      Object.entries(this.workers).forEach(([key, worker]) => {
        worker.onmessage = ({ data }) => {
          if (this.series && this.xAxis) {
            let lastDataItem = this.series.dataItems[this.series.dataItems.length - 1];
            let lastValue;
            if (lastDataItem) {
              lastValue = lastDataItem.get("valueY");
            }
            this.series.data.push(data);
            const newDataItem = this.series.dataItems[this.series.dataItems.length - 1];
            newDataItem.animate({
              key: "valueYWorking",
              to: data.value,
              from: lastValue,
              duration: 600,
              easing: this.easing
            });
            const animation = newDataItem.animate({
              key: "locationX",
              to: 0.5,
              from: -0.5,
              duration: 300
            });
            if (animation) {
              let tooltip = this.xAxis.get("tooltip");
              if (tooltip && !tooltip.isHidden()) {
                animation.events.on("stopped", ()=> this.xAxis?.updateTooltip())
              }
            }
          }
        }
      });
    }

    }

  loadData(): void {
    if (this.interval) {
      if (typeof Worker !== "undefined") {
        this.initWorker();
        this.interval.pipe(takeUntil(this.$destroy)).subscribe(() => {
          if (!this.isPlaying){
            return
          }
          if(!this.config.isRealTime &&  new Date() >= new Date(this.config.tillDate) ){
            this.isPlaying = false
            this.changeDetectorRef.detectChanges()
            return;
          }
          this.currentDate = new Date();
          if (this.series){
            if (this.workers) {
              this.workers[this.lastWorker].postMessage('');
              this.lastWorker = this.lastWorker === 2 ? 0 : this.lastWorker + 1;
            }
          }

        });
      }

    }
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
      this.loadData();
      this.addLegend();
      this.setScrollBar();
      if (this.chart) {
        console.log('sdf')
        this.chart?.appear(1000, 100);
      }

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
          valueYField: "value",
          valueXField: "date",
          tooltip: am5.Tooltip.new(this.root, {
            labelText: "{valueY}"
          })
        })
      );
      this.series.data.setAll([]);

      // this.series.data.setAll(
      //   [{
      //     date: new Date(2021, 0, 1).getTime(),
      //     value: 100
      //   }, {
      //     date: new Date(2021, 0, 2).getTime(),
      //     value: 320
      //   }, {
      //     date: new Date(2021, 0, 3).getTime(),
      //     value: 216
      //   }, {
      //     date: new Date(2021, 0, 4).getTime(),
      //     value: 150
      //   }, {
      //     date: new Date(2021, 0, 5).getTime(),
      //     value: 156
      //   }, {
      //     date: new Date(2021, 0, 6).getTime(),
      //     value: 199
      //   }, {
      //     date: new Date(2021, 0, 7).getTime(),
      //     value: 114
      //   }, {
      //     date: new Date(2021, 0, 8).getTime(),
      //     value: 269
      //   }, {
      //     date: new Date(2021, 0, 9).getTime(),
      //     value: 90
      //   }, {
      //     date: new Date(2021, 0, 10).getTime(),
      //     value: 300
      //   }, {
      //     date: new Date(2021, 0, 11).getTime(),
      //     value: 150
      //   }, {
      //     date: new Date(2021, 0, 12).getTime(),
      //     value: 110
      //   }, {
      //     date: new Date(2021, 0, 13).getTime(),
      //     value: 185
      //   }, {
      //     date: new Date(2021, 0, 14).getTime(),
      //     value: 105
      //   }]
      // );
    }
  }

  setAxis(): void {
    if (this.chart && this.root) {
      this.xAxis = this.chart.xAxes.push(
        am5xy.DateAxis.new(this.root, {
          baseInterval: {
            timeUnit: "second",
            count: 2
          },
          renderer: am5xy.AxisRendererX.new(this.root, {}),
          tooltip: am5.Tooltip.new(this.root, {})
        })
      );

      this.yAxis = this.chart.yAxes.push(
        am5xy.ValueAxis.new(this.root, {
          renderer: am5xy.AxisRendererY.new(this.root, {})
        })
      );
    }
  }

  setCursor(): void {
    if (this.root && this.chart) {
      const cursor = this.chart.set(
        "cursor",
        am5xy.XYCursor.new(this.root, {
          behavior: "zoomX"
        })
      );
      cursor.lineY.set("visible", false);
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
      this.chart.set("scrollbarX", am5.Scrollbar.new(this.root, { orientation: "horizontal" }));
      this.chart.set("scrollbarY", am5.Scrollbar.new(this.root, { orientation: "vertical" }));
    }
  }

  insertRecord(record: PollInterface): void {
    if (this.series) {
      this.series.data.push({ date: record.date, value: record.value });
    }
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.complete();
    if (this.workers) {
      Object.values(this.workers).forEach(item => item.terminate());
    }
    this.browserOnly(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }


  toggleRealtime() {
    if (this.isPlaying){
      this.isPlaying = false
    } else {
      this.isPlaying = true;
      this.config.isRealTime = true;
    }
  }
}


