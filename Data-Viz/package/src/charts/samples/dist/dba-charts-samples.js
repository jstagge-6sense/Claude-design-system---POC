"use strict";
var DBAChartSamples = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/charts/samples/samples.entry.ts
  var samples_entry_exports = {};
  __export(samples_entry_exports, {
    init: () => init,
    renderAll: () => renderAll,
    samples: () => samples
  });

  // src/charts/palette.generated.ts
  var PRIMARY_HUE = "teal";
  var USABLE = {
    "teal": [
      {
        "token": "core.color.teal.500",
        "step": "500",
        "hex": "#3c9faa",
        "contrast": 3.12
      },
      {
        "token": "core.color.teal.600",
        "step": "600",
        "hex": "#35848d",
        "contrast": 4.34
      },
      {
        "token": "core.color.teal.700",
        "step": "700",
        "hex": "#2a696f",
        "contrast": 6.27
      },
      {
        "token": "core.color.teal.800",
        "step": "800",
        "hex": "#275e63",
        "contrast": 7.32
      },
      {
        "token": "core.color.teal.900",
        "step": "900",
        "hex": "#214d50",
        "contrast": 9.37
      }
    ],
    "blue": [
      {
        "token": "core.color.blue.400",
        "step": "400",
        "hex": "#3e74cc",
        "contrast": 4.59
      },
      {
        "token": "core.color.blue.500",
        "step": "500",
        "hex": "#205fc5",
        "contrast": 5.99
      },
      {
        "token": "core.color.blue.600",
        "step": "600",
        "hex": "#0c47a7",
        "contrast": 8.49
      },
      {
        "token": "core.color.blue.700",
        "step": "700",
        "hex": "#0a3376",
        "contrast": 12.01
      }
    ],
    "green": [
      {
        "token": "core.color.green.500",
        "step": "500",
        "hex": "#109e57",
        "contrast": 3.47
      },
      {
        "token": "core.color.green.600",
        "step": "600",
        "hex": "#0c7d45",
        "contrast": 5.2
      },
      {
        "token": "core.color.green.700",
        "step": "700",
        "hex": "#0b6538",
        "contrast": 7.16
      },
      {
        "token": "core.color.green.800",
        "step": "800",
        "hex": "#0a522e",
        "contrast": 9.3
      },
      {
        "token": "core.color.green.900",
        "step": "900",
        "hex": "#093e24",
        "contrast": 12.17
      }
    ],
    "amber": [
      {
        "token": "core.color.amber.500",
        "step": "500",
        "hex": "#c37713",
        "contrast": 3.52
      },
      {
        "token": "core.color.amber.600",
        "step": "600",
        "hex": "#995d0f",
        "contrast": 5.35
      },
      {
        "token": "core.color.amber.700",
        "step": "700",
        "hex": "#7c4c0e",
        "contrast": 7.25
      },
      {
        "token": "core.color.amber.800",
        "step": "800",
        "hex": "#68410d",
        "contrast": 8.93
      },
      {
        "token": "core.color.amber.900",
        "step": "900",
        "hex": "#50320b",
        "contrast": 11.65
      }
    ],
    "red": [
      {
        "token": "core.color.red.300",
        "step": "300",
        "hex": "#d35a5a",
        "contrast": 3.9
      },
      {
        "token": "core.color.red.400",
        "step": "400",
        "hex": "#c84141",
        "contrast": 4.9
      },
      {
        "token": "core.color.red.500",
        "step": "500",
        "hex": "#ac3939",
        "contrast": 6.18
      },
      {
        "token": "core.color.red.600",
        "step": "600",
        "hex": "#913030",
        "contrast": 7.87
      },
      {
        "token": "core.color.red.700",
        "step": "700",
        "hex": "#742525",
        "contrast": 10.32
      },
      {
        "token": "core.color.red.800",
        "step": "800",
        "hex": "#672222",
        "contrast": 11.48
      },
      {
        "token": "core.color.red.900",
        "step": "900",
        "hex": "#541c1c",
        "contrast": 13.46
      }
    ],
    "ink": [
      {
        "token": "core.color.ink.600",
        "step": "600",
        "hex": "#668284",
        "contrast": 4.12
      },
      {
        "token": "core.color.ink.700",
        "step": "700",
        "hex": "#4a6b6d",
        "contrast": 5.81
      },
      {
        "token": "core.color.ink.800",
        "step": "800",
        "hex": "#34585b",
        "contrast": 7.8
      },
      {
        "token": "core.color.ink.900",
        "step": "900",
        "hex": "#063236",
        "contrast": 13.84
      }
    ]
  };
  var CATEGORICAL_STEPS = [
    {
      "token": "core.color.blue.500",
      "step": "500",
      "hex": "#205fc5",
      "contrast": 5.99,
      "hue": "blue"
    },
    {
      "token": "core.color.amber.600",
      "step": "600",
      "hex": "#995d0f",
      "contrast": 5.35,
      "hue": "amber"
    },
    {
      "token": "core.color.teal.600",
      "step": "600",
      "hex": "#35848d",
      "contrast": 4.34,
      "hue": "teal"
    },
    {
      "token": "core.color.red.500",
      "step": "500",
      "hex": "#ac3939",
      "contrast": 6.18,
      "hue": "red"
    },
    {
      "token": "core.color.green.600",
      "step": "600",
      "hex": "#0c7d45",
      "contrast": 5.2,
      "hue": "green"
    },
    {
      "token": "core.color.blue.400",
      "step": "400",
      "hex": "#3e74cc",
      "contrast": 4.59,
      "hue": "blue"
    },
    {
      "token": "core.color.amber.500",
      "step": "500",
      "hex": "#c37713",
      "contrast": 3.52,
      "hue": "amber"
    },
    {
      "token": "core.color.teal.500",
      "step": "500",
      "hex": "#3c9faa",
      "contrast": 3.12,
      "hue": "teal"
    },
    {
      "token": "core.color.red.300",
      "step": "300",
      "hex": "#d35a5a",
      "contrast": 3.9,
      "hue": "red"
    },
    {
      "token": "core.color.green.500",
      "step": "500",
      "hex": "#109e57",
      "contrast": 3.47,
      "hue": "green"
    },
    {
      "token": "core.color.blue.600",
      "step": "600",
      "hex": "#0c47a7",
      "contrast": 8.49,
      "hue": "blue"
    },
    {
      "token": "core.color.amber.700",
      "step": "700",
      "hex": "#7c4c0e",
      "contrast": 7.25,
      "hue": "amber"
    },
    {
      "token": "core.color.teal.700",
      "step": "700",
      "hex": "#2a696f",
      "contrast": 6.27,
      "hue": "teal"
    },
    {
      "token": "core.color.red.700",
      "step": "700",
      "hex": "#742525",
      "contrast": 10.32,
      "hue": "red"
    },
    {
      "token": "core.color.green.700",
      "step": "700",
      "hex": "#0b6538",
      "contrast": 7.16,
      "hue": "green"
    }
  ];
  var OTHER_STEP = { "token": "core.color.ink.800", "step": "800", "hex": "#34585b", "contrast": 7.8 };

  // src/charts/palette.ts
  function ramp(hue = PRIMARY_HUE) {
    return USABLE[hue].map((s) => s.hex);
  }
  function sequential(count, { hue = PRIMARY_HUE } = {}) {
    const r = ramp(hue);
    const n = Math.max(1, Math.round(count));
    if (n === 1) return [r[Math.floor((r.length - 1) / 2)]];
    if (n >= r.length) return [...r, ...Array(n - r.length).fill(r[r.length - 1])];
    return Array.from({ length: n }, (_, i) => r[Math.round(i * (r.length - 1) / (n - 1))]);
  }
  function single(hue = PRIMARY_HUE) {
    const r = ramp(hue);
    return r[Math.floor((r.length - 1) / 2)];
  }
  var OTHER_COLOR = OTHER_STEP.hex;
  function categorical(count) {
    return CATEGORICAL_STEPS.slice(0, Math.max(0, Math.min(15, count))).map((s) => s.hex);
  }
  var CATEGORICAL = CATEGORICAL_STEPS.map((s) => s.hex);
  function withAlpha(hex, alpha) {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${alpha})`;
  }

  // src/charts/theme.ts
  var text = (style) => ({
    fontFamily: `var(--core-typography-${style}-font-family)`,
    fontSize: `var(--core-typography-${style}-font-size)`,
    fontWeight: `var(--core-typography-${style}-font-weight)`
  });
  var PRIMARY = "var(--core-color-content-primary)";
  var SECONDARY = "var(--core-color-content-secondary)";
  var BORDER = "var(--core-color-border-standard)";
  var SURFACE = "var(--core-color-surface-control-default)";
  var DISABLED = "var(--core-color-content-disabled)";
  var FOCUS = "var(--core-color-border-focus)";
  var dbaTheme = {
    colors: [...CATEGORICAL],
    chart: {
      backgroundColor: "transparent",
      style: { fontFamily: "var(--core-typography-label-1-font-family)" },
      spacing: [16, 16, 16, 16]
    },
    title: { align: "left", style: { color: PRIMARY, ...text("heading-3") } },
    subtitle: { align: "left", style: { color: SECONDARY, ...text("help-1") } },
    credits: { enabled: false },
    exporting: { enabled: false },
    accessibility: {
      enabled: true,
      keyboardNavigation: { enabled: true }
    },
    legend: {
      itemStyle: { color: PRIMARY, ...text("label-1") },
      itemHoverStyle: { color: PRIMARY },
      itemHiddenStyle: { color: DISABLED },
      navigation: { activeColor: FOCUS, inactiveColor: DISABLED, style: { color: PRIMARY } },
      symbolRadius: 2
    },
    tooltip: {
      // Fill, stroke and radius are set in Charts.module.css via .highcharts-tooltip-box (surface and border tokens).
      backgroundColor: SURFACE,
      borderWidth: 1,
      borderColor: BORDER,
      shadow: false,
      style: { color: PRIMARY, ...text("label-1") }
    },
    xAxis: {
      lineColor: BORDER,
      tickColor: BORDER,
      gridLineColor: BORDER,
      // faded to the documented 16% border alpha in Charts.module.css
      labels: { style: { color: SECONDARY, ...text("help-1") } },
      title: { style: { color: SECONDARY, ...text("label-2") } },
      crosshair: { color: BORDER },
      minorGridLineColor: BORDER,
      minorTickColor: BORDER
    },
    yAxis: {
      lineColor: BORDER,
      tickColor: BORDER,
      gridLineColor: BORDER,
      gridLineWidth: 1,
      labels: { style: { color: SECONDARY, ...text("help-1") } },
      title: { style: { color: SECONDARY, ...text("label-2") } }
    },
    // Small containers: legend moves below, axis titles drop, x labels stay readable. Rules follow the chart container, not the window.
    responsive: {
      rules: [
        {
          condition: { maxWidth: 520 },
          chartOptions: {
            chart: { spacing: [8, 8, 8, 8] },
            legend: { align: "center", verticalAlign: "bottom", layout: "horizontal" },
            xAxis: { title: { text: void 0 }, labels: { step: void 0, autoRotation: [-45] } },
            yAxis: { title: { text: void 0 } }
          }
        }
      ]
    },
    noData: { style: { color: SECONDARY, ...text("label-1") } },
    plotOptions: {
      series: {
        borderWidth: 0,
        marker: { lineColor: SURFACE },
        dataLabels: { style: { color: PRIMARY, textOutline: "none", fontWeight: "var(--core-typography-label-2-font-weight)" } },
        states: { inactive: { opacity: 0.4 } }
      }
    }
  };

  // scripts/.chart-sample-stubs/react.js
  var forwardRef = (f) => f;
  var useMemo = (f) => f();
  var useEffect = () => {
  };
  var useRef = () => ({ current: null });

  // src/primitives/cx.ts
  var cx = (...v) => v.filter(Boolean).join(" ");

  // src/charts/highcharts.ts
  var hc = null;
  function getHighcharts() {
    if (!hc) throw new Error("DBA charts are not initialized. Import Highcharts and call initDbaCharts(Highcharts) once at startup.");
    return hc;
  }

  // src/charts/Charts.module.css
  var Charts_default = {
    root: "Charts_root",
    host: "Charts_host",
    placeholder: "Charts_placeholder",
    heading: "Charts_heading",
    shimmer: "Charts_shimmer",
    pulse: "Charts_pulse"
  };

  // scripts/.chart-sample-stubs/jsx-runtime.js
  var jsx = () => null;
  var jsxs = () => null;

  // src/charts/DbaChart.tsx
  var DbaChart = forwardRef(function DbaChart2({ options, title, description, subtitle, height = 320, loading, error, emptyMessage = "No data to show.", isEmpty, className, style, highchartsOptions }, ref) {
    const host = useRef(null);
    const chart = useRef(null);
    const state = loading ? "loading" : error ? "error" : isEmpty ? "empty" : "ready";
    useEffect(() => {
      if (state !== "ready" || !host.current) return;
      const hc2 = getHighcharts();
      const full = hc2.merge(
        {
          title: { text: title },
          subtitle: { text: subtitle },
          accessibility: { description },
          // a number fixes the height; anything else (CSS length) makes the chart fill its container (chart.height: null)
          chart: { height: typeof height === "number" ? height : null }
        },
        options,
        highchartsOptions != null ? highchartsOptions : {}
      );
      if (chart.current) chart.current.update(full, true, true);
      else chart.current = hc2.chart(host.current, full);
    }, [state, options, title, subtitle, description, height, highchartsOptions]);
    useEffect(() => {
      if (state !== "ready" || !host.current || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        var _a;
        return (_a = chart.current) == null ? void 0 : _a.reflow();
      });
      ro.observe(host.current);
      return () => ro.disconnect();
    }, [state]);
    useEffect(() => {
      if (state !== "ready" && chart.current) {
        chart.current.destroy();
        chart.current = null;
      }
    }, [state]);
    useEffect(
      () => () => {
        var _a;
        (_a = chart.current) == null ? void 0 : _a.destroy();
        chart.current = null;
      },
      []
    );
    const message = state === "error" ? typeof error === "string" ? error : `We couldn't load ${title}. Try again.` : state === "empty" ? emptyMessage : null;
    const cssHeight = typeof height === "number" ? `${height}px` : height;
    return /* @__PURE__ */ jsx("figure", { ref, className: cx(Charts_default.root, className), style: { ...style, ["--_chart-height"]: cssHeight }, "data-state": state, "data-fill": typeof height === "number" ? void 0 : "", "aria-busy": state === "loading" || void 0, children: state === "ready" ? /* @__PURE__ */ jsx("div", { ref: host, className: Charts_default.host, style: typeof height === "number" ? void 0 : { height: cssHeight } }) : state === "loading" ? /* @__PURE__ */ jsx("div", { className: Charts_default.placeholder, role: "status", "aria-label": `Loading ${title}`, children: /* @__PURE__ */ jsx("span", { className: Charts_default.shimmer, "aria-hidden": "true" }) }) : /* @__PURE__ */ jsxs("div", { className: Charts_default.placeholder, role: state === "error" ? "alert" : void 0, children: [
      /* @__PURE__ */ jsx("span", { className: Charts_default.heading, children: title }),
      /* @__PURE__ */ jsx("span", { children: message })
    ] }) });
  });

  // src/charts/format.ts
  function formatValue(value, f = {}) {
    const { kind = "count", compact = false, currency = "USD", locale, maximumFractionDigits, percentIsFraction = false } = f;
    if (kind === "percent") {
      const v = percentIsFraction ? value : value / 100;
      return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: maximumFractionDigits != null ? maximumFractionDigits : 1 }).format(v);
    }
    const opts = {
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: maximumFractionDigits != null ? maximumFractionDigits : compact ? 1 : 2
    };
    if (kind === "currency") Object.assign(opts, { style: "currency", currency });
    return new Intl.NumberFormat(locale, opts).format(value);
  }
  function formatChange(percent, locale) {
    const abs = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.abs(percent));
    return `${percent > 0 ? "+" : percent < 0 ? "-" : ""}${abs}%`;
  }

  // src/charts/presets.ts
  function valueLabel(fmt, locale) {
    return function() {
      var _a;
      return formatValue(Number(this.value), { ...fmt, locale: (_a = fmt == null ? void 0 : fmt.locale) != null ? _a : locale });
    };
  }
  function tooltipPoint(fmt, locale) {
    return function() {
      var _a, _b, _c, _d, _e;
      const y = formatValue(Number((_a = this.y) != null ? _a : 0), { ...fmt, locale: (_b = fmt == null ? void 0 : fmt.locale) != null ? _b : locale });
      const name = (_e = (_d = (_c = this.point) == null ? void 0 : _c.name) != null ? _d : this.key) != null ? _e : "";
      return `<span>${name ? `${name}: ` : ""}<b>${y}</b></span><br/><span>${this.series.name}</span>`;
    };
  }
  function legendFor(position = "bottom") {
    if (position === "none") return { enabled: false };
    return position === "right" ? { enabled: true, align: "right", verticalAlign: "middle", layout: "vertical" } : { enabled: true, align: "left", verticalAlign: "bottom", layout: "horizontal" };
  }
  function cartesianAxes(p, categories, locale) {
    return {
      xAxis: {
        categories,
        title: { text: p.xTitle },
        labels: { step: p.labelStep, overflow: "justify", style: { textOverflow: "ellipsis" } },
        crosshair: true
      },
      yAxis: {
        title: { text: p.yTitle },
        gridLineWidth: p.gridLines === false ? 0 : 1,
        labels: { formatter: valueLabel(p.valueFormat, locale) }
      }
    };
  }
  var BAR_END_RADIUS = 8;
  function barEndRadius(scope = "point") {
    return { radius: BAR_END_RADIUS, scope, where: "end" };
  }
  function barPadding(spacing, plotSize, count) {
    const slot = Math.max(1, plotSize / Math.max(1, count));
    return Math.min(0.45, spacing / 2 / slot);
  }

  // src/charts/AreaChart.tsx
  function buildAreaOptions(p) {
    const color = single(p.hue);
    return {
      chart: { type: p.curved === false ? "area" : "areaspline" },
      ...cartesianAxes(p, p.categories, p.locale),
      legend: { enabled: false },
      tooltip: { formatter: tooltipPoint(p.valueFormat, p.locale) },
      plotOptions: {
        area: { marker: { enabled: false } },
        areaspline: { marker: { enabled: false } },
        series: { lineWidth: 2 }
      },
      series: [
        {
          type: p.curved === false ? "area" : "areaspline",
          name: p.seriesName,
          data: p.values,
          color,
          fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, withAlpha(color, 0.4)], [1, withAlpha(color, 0.04)]] }
        }
      ]
    };
  }
  var AreaChart = forwardRef(function AreaChart2(props, ref) {
    const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props;
    const options = useMemo(() => buildAreaOptions(props), [props.categories, props.values, props.seriesName, props.curved, props.hue, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]);
    return /* @__PURE__ */ jsx(DbaChart, { ref, ...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }, options, isEmpty: props.values.length === 0 });
  });

  // src/charts/LineChart.tsx
  function buildLineOptions(p) {
    let i = 0;
    return {
      chart: { type: p.curved ? "spline" : "line" },
      ...cartesianAxes(p, p.categories, p.locale),
      legend: legendFor(p.legendPosition),
      tooltip: { shared: true, pointFormatter: tooltipPoint(p.valueFormat, p.locale) },
      plotOptions: { series: { lineWidth: 2, marker: { enabled: false, states: { hover: { enabled: true, radius: 4 } } } } },
      series: p.series.map((s) => ({
        type: p.curved ? "spline" : "line",
        name: s.name,
        data: s.data,
        color: s.other ? OTHER_COLOR : CATEGORICAL[i++ % CATEGORICAL.length]
      }))
    };
  }
  var LineChart = forwardRef(function LineChart2(props, ref) {
    const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props;
    const options = useMemo(() => buildLineOptions(props), [props.categories, props.series, props.curved, props.legendPosition, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]);
    return /* @__PURE__ */ jsx(DbaChart, { ref, ...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }, options, isEmpty: props.series.length === 0 || props.categories.length === 0 });
  });

  // src/charts/BarChart.tsx
  var PLOT_CHROME = 96;
  function buildBarOptions(p) {
    var _a, _b, _c;
    const mode = (_a = p.colorMode) != null ? _a : "single";
    const n = p.data.length;
    const colors = mode === "single" ? p.data.map(() => single(p.hue)) : mode === "sequential" ? sequential(n, { hue: p.hue }).reverse() : categorical(n);
    const ranked = [...p.data.keys()].sort((a, b) => p.data[b].value - p.data[a].value);
    const byIndex = new Array(n);
    if (mode === "sequential") ranked.forEach((idx, rank) => byIndex[idx] = colors[rank]);
    const heightPx = typeof p.height === "number" ? p.height : 320;
    return {
      chart: { type: p.orientation === "vertical" ? "column" : "bar" },
      ...cartesianAxes(p, p.data.map((d) => d.name), p.locale),
      legend: { enabled: false },
      tooltip: { formatter: tooltipPoint(p.valueFormat, p.locale) },
      plotOptions: {
        series: { groupPadding: 0, pointPadding: barPadding((_b = p.spacing) != null ? _b : 12, Math.max(1, heightPx - PLOT_CHROME), n), borderRadius: barEndRadius() }
      },
      series: [
        {
          type: p.orientation === "vertical" ? "column" : "bar",
          name: (_c = p.seriesName) != null ? _c : "Value",
          colorByPoint: mode !== "single",
          color: single(p.hue),
          data: p.data.map((d, i) => ({ name: d.name, y: d.value, color: mode === "sequential" ? byIndex[i] : mode === "categorical" ? colors[i] : void 0 })),
          dataLabels: p.showValues === false ? { enabled: false } : { enabled: true }
        }
      ]
    };
  }
  var BarChart = forwardRef(function BarChart2(props, ref) {
    const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props;
    const options = useMemo(() => buildBarOptions(props), [props.data, props.seriesName, props.orientation, props.colorMode, props.hue, props.spacing, props.showValues, props.height, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]);
    return /* @__PURE__ */ jsx(DbaChart, { ref, ...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }, options, isEmpty: props.data.length === 0 });
  });

  // src/charts/StackedGroupedBarChart.tsx
  var PLOT_CHROME2 = 120;
  function buildStackedGroupedOptions(p) {
    var _a, _b;
    const mode = (_a = p.mode) != null ? _a : "stacked";
    const names = p.series.filter((s) => !s.other).length;
    const pool = p.colorMode === "single" ? sequential(Math.max(1, names), { hue: p.hue }) : categorical(names);
    let i = 0;
    const heightPx = typeof p.height === "number" ? p.height : 320;
    const stacking = mode === "grouped" ? void 0 : mode === "percent" ? "percent" : "normal";
    return {
      chart: { type: p.orientation === "vertical" ? "column" : "bar" },
      ...cartesianAxes(p, p.categories, p.locale),
      legend: legendFor(p.legendPosition),
      tooltip: { shared: false, pointFormatter: tooltipPoint(p.valueFormat, p.locale) },
      plotOptions: {
        series: {
          stacking,
          borderRadius: barEndRadius(stacking ? "stack" : "point"),
          // 8px at the end of the bar or of the whole stack
          groupPadding: 0.1,
          pointPadding: mode === "grouped" ? 0.05 : barPadding((_b = p.spacing) != null ? _b : 12, Math.max(1, heightPx - PLOT_CHROME2), p.categories.length),
          borderWidth: stacking ? 1 : 0,
          // thin separator between stacked segments (outline helps non-color distinction)
          borderColor: "var(--core-color-surface-control-default)"
        }
      },
      series: p.series.map((s) => ({
        type: p.orientation === "vertical" ? "column" : "bar",
        name: s.name,
        data: s.data,
        color: s.other ? OTHER_COLOR : pool[i++ % pool.length]
      }))
    };
  }
  var StackedGroupedBarChart = forwardRef(function StackedGroupedBarChart2(props, ref) {
    const { title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions } = props;
    const options = useMemo(() => buildStackedGroupedOptions(props), [props.categories, props.series, props.mode, props.orientation, props.colorMode, props.hue, props.spacing, props.legendPosition, props.height, props.xTitle, props.yTitle, props.labelStep, props.gridLines, props.valueFormat, props.locale]);
    return /* @__PURE__ */ jsx(DbaChart, { ref, ...{ title, description, subtitle, height, loading, error, emptyMessage, className, style, highchartsOptions }, options, isEmpty: props.series.length === 0 || props.categories.length === 0 });
  });

  // src/charts/DonutChart.tsx
  function buildDonutOptions(p) {
    var _a, _b, _c, _d, _e, _f, _g;
    const size = (_a = p.size) != null ? _a : 300;
    const sum = p.data.reduce((a, d) => a + d.value, 0);
    const total = (_b = p.total) != null ? _b : sum;
    const fmt = { ...p.valueFormat, compact: (_d = (_c = p.valueFormat) == null ? void 0 : _c.compact) != null ? _d : true, locale: (_f = (_e = p.valueFormat) == null ? void 0 : _e.locale) != null ? _f : p.locale };
    const pool = categorical(p.data.filter((d) => !d.other).length);
    let i = 0;
    const parts = [formatValue(total, fmt), p.subtext, p.change !== void 0 ? formatChange(p.change, p.locale) : void 0].filter(Boolean);
    return {
      chart: typeof size === "number" ? { type: "pie", height: size, width: p.legendPosition === "right" ? void 0 : size } : { type: "pie", height: null },
      // Center metric: the subtitle floats in the middle of the donut, so the real title stays top-left.
      subtitle: { align: "center", verticalAlign: "middle", floating: true, y: 24, text: parts.join("<br/>"), style: { textAlign: "center" } },
      legend: legendFor((_g = p.legendPosition) != null ? _g : "right"),
      tooltip: {
        pointFormatter: function() {
          var _a2, _b2;
          return `<b>${formatValue(Number((_a2 = this.y) != null ? _a2 : 0), fmt)}</b> (${formatValue((_b2 = this.percentage) != null ? _b2 : 0, { kind: "percent" })})`;
        }
      },
      plotOptions: {
        pie: {
          innerSize: "65%",
          showInLegend: true,
          dataLabels: { enabled: false },
          borderWidth: 2,
          borderColor: "var(--core-color-surface-control-default)",
          // separator between segments, not color alone
          center: ["50%", "50%"]
        }
      },
      series: [
        {
          type: "pie",
          name: p.title,
          data: p.data.map((d) => ({ name: d.name, y: d.value, color: d.other ? OTHER_COLOR : pool[i++ % pool.length] }))
        }
      ]
    };
  }
  var DonutChart = forwardRef(function DonutChart2(props, ref) {
    var _a;
    const { title, description, loading, error, emptyMessage, className, style, highchartsOptions } = props;
    const options = useMemo(() => buildDonutOptions(props), [props.data, props.size, props.total, props.valueFormat, props.subtext, props.change, props.legendPosition, props.title, props.locale]);
    return /* @__PURE__ */ jsx(DbaChart, { ref, ...{ title, description, height: props.size === "fill" ? "100%" : (_a = props.size) != null ? _a : 300, loading, error, emptyMessage, className, style, highchartsOptions }, options, isEmpty: props.data.length === 0 || props.data.every((d) => d.value === 0) });
  });

  // src/charts/samples/editor.ts
  var KEY = "6si-ds-preview-overrides-v1";
  var HEX = /^#[0-9a-fA-F]{6}$/;
  var LAYERS = ["all", "semantic", "primitive", "component"];
  function mountEditor(onChange) {
    var _a;
    const data = window.__DS_TOKENS__;
    const tokens = (_a = data == null ? void 0 : data.tokens) != null ? _a : {};
    const names = Object.keys(tokens);
    const root = document.documentElement;
    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      overrides = {};
    }
    const cssVarOf = (n) => {
      var _a2;
      return (_a2 = tokens[n]) == null ? void 0 : _a2.cssVar;
    };
    const computed = (t) => getComputedStyle(root).getPropertyValue(t.kind === "typography" ? `${t.cssVar}-font` : t.cssVar).trim();
    function applyOne(n) {
      const t = tokens[n];
      const o = overrides[n];
      if (!t || t.kind === "typography") return;
      if (!o) {
        root.style.removeProperty(t.cssVar);
        return;
      }
      root.style.setProperty(t.cssVar, o.mode === "alias" ? `var(${cssVarOf(o.value)})` : o.value);
    }
    const save = () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(overrides));
      } catch {
      }
    };
    let raf = 0;
    const changed = () => {
      save();
      refreshCount();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onChange);
    };
    const set = (n, o) => {
      overrides = { ...overrides, [n]: o };
      applyOne(n);
      changed();
    };
    const clear = (n) => {
      const { [n]: _g, ...rest } = overrides;
      overrides = rest;
      applyOne(n);
      changed();
    };
    const clearAll = () => {
      const ks = Object.keys(overrides);
      overrides = {};
      ks.forEach(applyOne);
      changed();
      renderList();
    };
    function patch() {
      const out = {};
      for (const [n, o] of Object.entries(overrides)) {
        const t = tokens[n];
        let cur = out;
        const parts = n.split(".");
        parts.slice(0, -1).forEach((p) => {
          cur = cur[p] = cur[p] || {};
        });
        cur[parts[parts.length - 1]] = { ...(t == null ? void 0 : t.type) ? { $type: t.type } : {}, $value: o.mode === "alias" ? `{${o.value}}` : o.value, $description: `Edited in chart samples. Was: ${t == null ? void 0 : t.value}` };
      }
      return JSON.stringify(out, null, 2);
    }
    const h = (tag, attrs = {}, ...kids) => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) k === "class" ? el.className = v : el.setAttribute(k, v);
      kids.forEach((k) => el.append(k));
      return el;
    };
    const seg = (label, opts, cur, pick) => {
      const g = h("div", { class: "pv-seg", role: "group", "aria-label": label });
      opts.forEach((o) => {
        const b = h("button", { type: "button", "aria-pressed": String(o === cur) }, o);
        if (o === cur) b.className = "on";
        b.onclick = () => {
          pick(o);
          [...g.children].forEach((c) => {
            const on = c === b;
            c.className = on ? "on" : "";
            c.setAttribute("aria-pressed", String(on));
          });
        };
        g.append(b);
      });
      return g;
    };
    const counts = { primitive: 0, semantic: 0, component: 0, theme: 0 };
    names.forEach((n) => {
      counts[tokens[n].layer]++;
    });
    const top = document.getElementById("pv-top");
    const prefOf = (k, d) => {
      try {
        return localStorage.getItem(k) || d;
      } catch {
        return d;
      }
    };
    const setPref = (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch {
      }
    };
    const theme = prefOf("dba-samples-theme", "light");
    const density = prefOf("dba-samples-density", "default");
    const applyMode = () => {
      theme === "dark" ? root.setAttribute("data-theme", "dark") : root.removeAttribute("data-theme");
    };
    const applyDensity = (d) => {
      d === "default" ? root.removeAttribute("data-density") : root.setAttribute("data-density", d);
    };
    applyMode();
    applyDensity(density);
    const editedCount = h("span", { class: "pv-muted", role: "status" });
    function refreshCount() {
      var _a2, _b, _c;
      const n = Object.keys(overrides).length;
      editedCount.textContent = `${n} edited`;
      (_a2 = document.getElementById("pv-copy")) == null ? void 0 : _a2.toggleAttribute("disabled", !n);
      (_b = document.getElementById("pv-dl")) == null ? void 0 : _b.toggleAttribute("disabled", !n);
      (_c = document.getElementById("pv-reset")) == null ? void 0 : _c.toggleAttribute("disabled", !n);
    }
    const toggle = h("button", { type: "button", class: "pv-btn", "aria-pressed": "false", "aria-controls": "pv-editor" }, "Token editor");
    const stats = h(
      "span",
      { class: "pv-muted", title: "Tokens built from tokens/*.json" },
      `${names.length.toLocaleString()} tokens: ${counts.primitive} primitive, ${counts.semantic} semantic, ${counts.component} component`
    );
    top.append(
      h("h1", {}, "DBA charts samples"),
      stats,
      h("span", { class: "grow" }),
      h("span", { class: "pv-muted" }, "Theme"),
      seg("Theme", ["light", "dark"], theme, (v) => {
        setPref("dba-samples-theme", v);
        v === "dark" ? root.setAttribute("data-theme", "dark") : root.removeAttribute("data-theme");
        onChange();
      }),
      h("span", { class: "pv-muted" }, "Density"),
      seg("Density", ["compact", "default", "spacious"], density, (v) => {
        setPref("dba-samples-density", v);
        applyDensity(v);
        onChange();
      }),
      editedCount,
      toggle
    );
    const panel = h("aside", { id: "pv-editor", class: "pv-editor", "aria-label": "Token editor" });
    panel.hidden = true;
    const q = h("input", { class: "pv-input", placeholder: "Search tokens or descriptions", "aria-label": "Search tokens" });
    let layer = "semantic";
    let limit = 120;
    const list = h("div", { class: "pv-list" });
    const msg = h("div", { class: "pv-muted", role: "status" });
    const closeBtn = h("button", { type: "button", class: "pv-btn", "aria-label": "Close token editor" }, "Close");
    const copy = h("button", { type: "button", class: "pv-btn", id: "pv-copy" }, "Copy edits");
    const dl = h("button", { type: "button", class: "pv-btn", id: "pv-dl" }, "Download");
    const reset = h("button", { type: "button", class: "pv-btn", id: "pv-reset" }, "Reset all");
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(patch());
        msg.textContent = "Copied";
      } catch {
        msg.textContent = "Copy blocked. Use Download.";
      }
    };
    dl.onclick = () => {
      const a = h("a");
      a.href = URL.createObjectURL(new Blob([patch()], { type: "application/json" }));
      a.download = "token-edits.json";
      a.click();
    };
    reset.onclick = clearAll;
    const layerSeg = seg("Layer filter", [...LAYERS], layer, (v) => {
      layer = v;
      limit = 120;
      renderList();
    });
    q.oninput = () => {
      limit = 120;
      renderList();
    };
    panel.append(
      h("header", { class: "pv-editor-head" }, h("strong", {}, "Token editor"), closeBtn),
      h(
        "div",
        { class: "pv-editor-tools" },
        q,
        layerSeg,
        h("div", { class: "pv-actions" }, copy, dl, reset),
        msg,
        h("p", { class: "pv-hint" }, "Edits apply live to the charts and are saved in this browser (shared with the design-system preview). Chart series colors come from teal, blue, green, amber, red and ink primitives: edit those to recolor charts. Aliases accept any token of the same kind.")
      ),
      list
    );
    document.getElementById("pv-body").append(panel);
    const setOpen = (open) => {
      panel.hidden = !open;
      toggle.setAttribute("aria-pressed", String(open));
      document.getElementById("pv-body").classList.toggle("no-editor", !open);
      setTimeout(onChange, 0);
    };
    toggle.onclick = () => setOpen(panel.hidden === true);
    closeBtn.onclick = () => setOpen(false);
    const order = { component: 0, semantic: 1, primitive: 2, theme: 3 };
    function aliasCands(n) {
      const t = tokens[n];
      const allowed = t.layer === "component" ? ["semantic", "component"] : t.layer === "semantic" ? ["primitive", "semantic"] : [];
      return names.filter((o) => o !== n && allowed.includes(tokens[o].layer) && tokens[o].kind === t.kind);
    }
    function row(n) {
      const t = tokens[n];
      const ov = overrides[n];
      const cur = computed(t);
      const r = h("div", { class: "pv-row" + (ov ? " is-edited" : "") });
      const head = h("div", { class: "pv-row-head" }, h("code", { class: "pv-name", title: t.description || n }, n.replace(/^(component|core)\./, "")), h("span", { class: `pv-pill pv-${t.layer}` }, t.layer));
      if (t.gap) head.append(h("span", { class: "pv-pill pv-gap", title: t.description || "" }, t.gap));
      if (ov) {
        const b = h("button", { type: "button", class: "pv-link" }, "reset");
        b.onclick = () => {
          clear(n);
          renderList();
        };
        head.append(b);
      }
      r.append(head);
      const body = h("div", { class: "pv-row-body" });
      if (t.kind === "color" || t.kind === "gradient") body.append(h("span", { class: "pv-swatch" + (t.kind === "gradient" ? " wide" : ""), style: `background:var(${t.cssVar})` }));
      if (t.kind === "color" && HEX.test(cur)) {
        const c = h("input", { type: "color", "aria-label": `${n} color`, value: cur });
        c.oninput = () => set(n, { mode: "raw", value: c.value });
        c.onchange = () => renderList();
        body.append(c);
      }
      if (t.kind === "typography") body.append(h("span", { class: "pv-muted" }, `${cur || "(composite)"} (edit in the preview app)`));
      else {
        const i = h("input", { class: "pv-input", "aria-label": `${n} value`, spellcheck: "false" });
        i.value = (ov == null ? void 0 : ov.mode) === "raw" ? ov.value : cur;
        const commit = () => {
          const v = i.value.trim();
          if (v && v !== ((ov == null ? void 0 : ov.mode) === "raw" ? ov.value : cur)) {
            set(n, { mode: "raw", value: v });
            renderList();
          }
        };
        i.onblur = commit;
        i.onkeydown = (e) => {
          if (e.key === "Enter") commit();
        };
        body.append(i);
      }
      r.append(body);
      if (t.layer !== "primitive" && t.kind !== "typography") {
        const aliasNow = ov ? ov.mode === "alias" ? ov.value : "" : t.aliases.length === 1 && t.css && /^var\(/.test(t.css) ? t.aliases[0] : "";
        const id = `al-${n}`;
        const a = h("input", { class: "pv-input", list: id, "aria-label": `${n} alias`, placeholder: "type a token name", spellcheck: "false" });
        a.value = aliasNow;
        const dlist = h("datalist", { id });
        const fill = () => {
          if (dlist.childElementCount) return;
          aliasCands(n).forEach((c) => dlist.append(h("option", { value: c })));
        };
        a.onfocus = fill;
        const commit = () => {
          const v = a.value.trim();
          if (tokens[v] && v !== aliasNow) {
            set(n, { mode: "alias", value: v });
            renderList();
          }
        };
        a.onchange = commit;
        a.onblur = commit;
        r.append(h("div", { class: "pv-row-alias" }, h("label", {}, "alias", a)), dlist);
      }
      return r;
    }
    function renderList() {
      const needle = q.value.trim().toLowerCase();
      const hits = names.filter((n) => layer === "all" || tokens[n].layer === layer).filter((n) => !needle || n.toLowerCase().includes(needle) || (tokens[n].description || "").toLowerCase().includes(needle)).sort((a, b) => order[tokens[a].layer] - order[tokens[b].layer] || a.localeCompare(b, void 0, { numeric: true }));
      list.replaceChildren(...hits.slice(0, limit).map(row));
      if (hits.length > limit) {
        const m = h("button", { type: "button", class: "pv-btn" }, `Show more (${hits.length - limit} left)`);
        m.onclick = () => {
          limit += 200;
          renderList();
        };
        list.append(m);
      }
      if (!hits.length) list.append(h("p", { class: "pv-muted" }, names.length ? "No tokens match." : "Token data not found. Run npm run samples:charts."));
    }
    Object.keys(overrides).forEach(applyOne);
    refreshCount();
    renderList();
    if (Object.keys(overrides).length) onChange();
  }

  // src/charts/samples/sample-data.ts
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var engagedAccounts = [820, 870, 860, 910, 990, 970, 1040, 1120, 1180, 1250, 1230, 1250];
  var pipelineByRegion = [
    { name: "North America", data: [4.1, 4.4, 4.9, 5.2, 5.8, 6.1] },
    { name: "EMEA", data: [2.2, 2.5, 2.4, 2.9, 3.1, 3.4] },
    { name: "APAC", data: [1.1, 1.3, 1.6, 1.5, 1.9, 2.2] },
    { name: "Other", data: [0.4, 0.5, 0.4, 0.6, 0.6, 0.7], other: true }
  ];
  var industries = [
    { name: "Software", value: 420 },
    { name: "Financial services", value: 310 },
    { name: "Healthcare", value: 280 },
    { name: "Manufacturing", value: 190 },
    { name: "Retail", value: 140 }
  ];
  var channels = [
    { name: "Email", value: 52 },
    { name: "Paid", value: 38 },
    { name: "Events", value: 27 },
    { name: "Organic", value: 61 }
  ];
  var quarters = ["Q1", "Q2", "Q3", "Q4"];
  var leadsByChannel = [
    { name: "Email", data: [30, 34, 28, 40] },
    { name: "Paid", data: [20, 22, 25, 18] },
    { name: "Events", data: [10, 12, 15, 20] },
    { name: "Other", data: [4, 5, 3, 6], other: true }
  ];
  var accountsByTier = [
    { name: "Tier 1", value: 540 },
    { name: "Tier 2", value: 320 },
    { name: "Tier 3", value: 210 },
    { name: "Other", value: 60, other: true }
  ];

  // src/charts/samples/samples.entry.ts
  function samples() {
    const mk = (id, title, description, height, options) => ({ id, title, description, height, options });
    return [
      mk(
        "area",
        "Engaged accounts",
        "Engaged accounts grew from 820 in January to 1,250 in December.",
        320,
        buildAreaOptions({ title: "Engaged accounts", description: "", categories: MONTHS, values: engagedAccounts, seriesName: "Engaged accounts", labelStep: 2, yTitle: "Accounts" })
      ),
      mk(
        "line",
        "Pipeline by region",
        "Pipeline created by region per month. North America leads in every month.",
        320,
        buildLineOptions({ title: "Pipeline by region", description: "", categories: MONTHS.slice(0, 6), series: pipelineByRegion, valueFormat: { kind: "currency", compact: true }, yTitle: "Pipeline" })
      ),
      mk(
        "bar",
        "Top industries",
        "Account counts by industry, software first.",
        320,
        buildBarOptions({ title: "Top industries", description: "", data: industries, seriesName: "Accounts" })
      ),
      mk(
        "bar-sequential",
        "Top industries (sequential)",
        "Same data, darker bars for larger values.",
        320,
        buildBarOptions({ title: "Top industries (sequential)", description: "", data: industries, colorMode: "sequential", seriesName: "Accounts" })
      ),
      mk(
        "bar-categorical",
        "Leads by channel (columns, categorical)",
        "Leads by channel.",
        320,
        buildBarOptions({ title: "Leads by channel", description: "", data: channels, orientation: "vertical", colorMode: "categorical", seriesName: "Leads" })
      ),
      mk(
        "stacked",
        "Leads by channel (stacked)",
        "Stacked leads by channel per quarter.",
        340,
        buildStackedGroupedOptions({ title: "Leads by channel (stacked)", description: "", categories: quarters, series: leadsByChannel, orientation: "vertical" })
      ),
      mk(
        "grouped",
        "Leads by channel (grouped)",
        "Leads by channel per quarter, side by side.",
        340,
        buildStackedGroupedOptions({ title: "Leads by channel (grouped)", description: "", categories: quarters, series: leadsByChannel, mode: "grouped", orientation: "vertical" })
      ),
      mk(
        "percent",
        "Share of leads (100%)",
        "Share of leads by channel per quarter.",
        340,
        buildStackedGroupedOptions({ title: "Share of leads (100%)", description: "", categories: quarters, series: leadsByChannel, mode: "percent", legendPosition: "right" })
      ),
      mk(
        "donut",
        "Accounts by tier",
        "Accounts by tier. Tier 1 is the largest segment.",
        300,
        buildDonutOptions({ title: "Accounts by tier", description: "", data: accountsByTier, size: "fill", subtext: "accounts", change: 4.2 })
      )
    ];
  }
  var HEX_TO_VAR = /* @__PURE__ */ new Map();
  for (const steps of Object.values(USABLE)) for (const st of steps) HEX_TO_VAR.set(st.hex.toLowerCase(), "--" + st.token.replace(/\./g, "-"));
  var css = getComputedStyle.bind(window);
  function liveColor(hex) {
    const v = HEX_TO_VAR.get(hex.toLowerCase());
    return v && css(document.documentElement).getPropertyValue(v).trim() || hex;
  }
  function toRgb(c) {
    const m = /^#([0-9a-f]{6})$/i.exec(c);
    if (m) {
      const n = parseInt(m[1], 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    const r = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c);
    return r ? [+r[1], +r[2], +r[3]] : null;
  }
  var RGB_TO_HEX = /* @__PURE__ */ new Map();
  HEX_TO_VAR.forEach((_v, hex) => {
    const c = toRgb(hex);
    if (c) RGB_TO_HEX.set(c.join(","), hex);
  });
  function recolor(o) {
    if (typeof o === "string") {
      if (HEX_TO_VAR.has(o.toLowerCase())) return liveColor(o);
      const m = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(o);
      const hex = m && RGB_TO_HEX.get(`${m[1]},${m[2]},${m[3]}`);
      if (m && hex) {
        const c = toRgb(liveColor(hex));
        if (c) return `rgba(${c.join(", ")}, ${m[4]})`;
      }
      return o;
    }
    if (Array.isArray(o)) return o.map(recolor);
    if (o && typeof o === "object" && Object.getPrototypeOf(o) === Object.prototype) {
      const out = {};
      for (const [k, v] of Object.entries(o)) out[k] = recolor(v);
      return out;
    }
    return o;
  }
  var live = /* @__PURE__ */ new Map();
  var observed = /* @__PURE__ */ new Set();
  var HC = null;
  function draw() {
    var _a;
    if (!HC) return;
    HC.setOptions(recolor(dbaTheme));
    for (const s of samples()) {
      const el = document.getElementById(`chart-${s.id}`);
      if (!el) continue;
      (_a = live.get(s.id)) == null ? void 0 : _a.destroy();
      const chart = HC.chart(
        el,
        HC.merge({ title: { text: s.title }, accessibility: { description: s.description } }, recolor(s.options), { chart: { height: null, width: null } })
      );
      live.set(s.id, chart);
      if (typeof ResizeObserver !== "undefined" && !observed.has(s.id)) {
        observed.add(s.id);
        new ResizeObserver(() => {
          var _a2;
          return (_a2 = live.get(s.id)) == null ? void 0 : _a2.reflow();
        }).observe(el);
      }
    }
  }
  function renderAll(Highcharts) {
    HC = Highcharts;
    draw();
  }
  function init() {
    mountEditor(draw);
  }
  return __toCommonJS(samples_entry_exports);
})();
