import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfigInterface, UtilsService } from "../core";
import { interval, Observable, Subject, takeUntil } from "rxjs";
import { FormControl } from "@angular/forms";
import {
  BarSeriesOption,
  DataZoomComponentOption,
  GridComponentOption,
  LegendComponentOption,
  LineSeriesOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption
} from "echarts";
import * as echarts from "echarts/core";


@Component({
  selector: "app-time-travel-selector",
  templateUrl: "./time-travel-selector.component.html",
  styleUrls: ["./time-travel-selector.component.scss"]
})
export class TimeTravelSelectorComponent implements OnInit, OnDestroy {
  myChart: any;
  currentDate = new Date();
  isDark = new FormControl(true);
  lastWorker = 0;
  isPlaying = true;
  data: { categoryData: number[], valueData: number[] } = {
    categoryData: [],
    valueData: []
  };
  currentZoomIndex?: number | null;
  options: echarts.ComposeOption<| TitleComponentOption
    | ToolboxComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | LegendComponentOption
    | DataZoomComponentOption
    | BarSeriesOption
    | LineSeriesOption> = {
    title: {
      text: "Time traveler data",
      left: 10
    },
    grid: {
      bottom: 90
    }
  };
  updateOptions: any;
  private $destroy = new Subject();
  private config: ConfigInterface = {
    isRealTime: true,
    tillDate: this.utilsService.futureDateFromToday(0, 1).toISOString(),
    interval: 500
  };
  private readonly interval?: Observable<number>;
  private workers?: Record<number, Worker>;

  constructor(
    private route: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
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


  initWorker(): void {
    if (typeof Worker !== "undefined") {
      this.workers = {
        0: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), { type: "module" })
        // 1: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), { type: "module" }),
        // 2: new Worker(new URL("../core/workers/poll-generator.worker", import.meta.url), { type: "module" })
      };
      Object.values(this.workers).forEach((worker) => {
        worker.onmessage = ({ data }) => {
          this.data.valueData.push(data.value);
          this.data.categoryData.push(data.date);
          this.updateOptions = {
            series: [{
              data: this.data.valueData
            }],
            xAxis: { data: this.data.categoryData }
          };
        };
      });
    }

  }

  loadData(): void {
    if (this.interval) {
      if (typeof Worker !== "undefined") {
        this.initWorker();
        this.interval.pipe(takeUntil(this.$destroy)).subscribe(() => {
          if (!this.isPlaying) {
            return;
          }
          if (!this.config.isRealTime && new Date() >= new Date(this.config.tillDate)) {
            this.isPlaying = false;
            this.changeDetectorRef.detectChanges();
            return;
          }
          this.currentDate = new Date();
          if (this.workers) {
            this.workers[this.lastWorker].postMessage("");
            // this.lastWorker = this.lastWorker === (Object.values(this.workers).length -1) ? 0 : this.lastWorker + 1;
          }
        });
      }

    }
  }

  ngOnInit() {
    this.generateGraph();
  }

  generateGraph(): void {
    this.setAxis();
    this.setSeries();
    this.addTooltip();
    this.addToolbox();
    this.setScrollBar();
    this.loadData();
  }

  setSeries(): void {
    this.options.series = [
      {
        name: "Value",
        type: "bar",
        data: this.data.valueData,
        large: true,
        animation: false
      }
    ];
  }

  setAxis(): void {
    this.options.xAxis = {
      data: this.data.categoryData,
      silent: false,
      splitLine: {
        show: false
      },
      splitArea: {
        show: false
      }
    };
    this.options.yAxis = {
      splitArea: {
        show: false
      }
    };
  }

  addTooltip(): void {
    this.options.tooltip = {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    };
  }

  addToolbox(): void {
    this.options.toolbox = {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        saveAsImage: {
          pixelRatio: 2
        },
        dataView: { readOnly: false },
        restore: {}
      }
    };

  }

  setScrollBar(): void {
    this.options.dataZoom = [
      {
        type: "slider"
      }
    ];
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.complete();
    if (this.workers) {
      Object.values(this.workers).forEach(item => item.terminate());
    }
  }


  toggleRealtime() {
    if (this.isPlaying) {
      this.isPlaying = false;
    } else {
      this.isPlaying = true;
      this.config.isRealTime = true;
    }
  }

  zoomBatch(clickEvent: any) {
    const zoomSize = 6;
    let startValue, endValue;
    if (this.currentZoomIndex) {
      startValue = this.data.categoryData[0];
      endValue = this.data.categoryData[this.data.valueData.length - 1];
      this.currentZoomIndex = null;
    } else {
      startValue = this.data.categoryData[Math.max(clickEvent.dataIndex - (zoomSize / 2), 0)];
      endValue = this.data.categoryData[Math.min(clickEvent.dataIndex + (zoomSize / 2), this.data.valueData.length - 1)];
      this.currentZoomIndex = clickEvent.dataIndex;
    }
    this.myChart.dispatchAction({
      type: "dataZoom",
      startValue: startValue,
      endValue: endValue
    });
  }

  onChartInit(instance: any): void {
    this.myChart = instance;
  }
}


