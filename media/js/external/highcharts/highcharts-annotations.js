/*
 Highcharts JS v10.2.0 (2022-07-05)
 Annotations module
 (c) 2009-2021 Torstein Honsi
 License: www.highcharts.com/license
*/
(function (c) {
    "object" === typeof module && module.exports
        ? ((c["default"] = c), (module.exports = c))
        : "function" === typeof define && define.amd
        ? define("highcharts/modules/annotations-advanced", ["highcharts"], function (v) {
              c(v);
              c.Highcharts = v;
              return c;
          })
        : c("undefined" !== typeof Highcharts ? Highcharts : void 0);
})(function (c) {
    function v(h, c, n, k) {
        h.hasOwnProperty(c) || ((h[c] = k.apply(null, n)), "function" === typeof CustomEvent && window.dispatchEvent(new CustomEvent("HighchartsModuleLoaded", { detail: { path: c, module: h[c] } })));
    }
    c = c ? c._modules : {};
    v(c, "Extensions/Annotations/Mixins/EventEmitterMixin.js", [c["Core/Globals.js"], c["Core/Utilities.js"]], function (h, c) {
        var l = c.addEvent,
            k = c.fireEvent,
            q = c.objectEach,
            m = c.pick,
            e = c.removeEvent;
        return {
            addEvents: function () {
                var a = this,
                    b = function (b) {
                        l(
                            b,
                            h.isTouchDevice ? "touchstart" : "mousedown",
                            function (b) {
                                a.onMouseDown(b);
                            },
                            { passive: !1 }
                        );
                    };
                b(this.graphic.element);
                (a.labels || []).forEach(function (d) {
                    d.options.useHTML && d.graphic.text && b(d.graphic.text.element);
                });
                q(a.options.events, function (b, d) {
                    var f = function (f) {
                        ("click" === d && a.cancelClick) || b.call(a, a.chart.pointer.normalize(f), a.target);
                    };
                    if (-1 === (a.nonDOMEvents || []).indexOf(d)) a.graphic.on(d, f);
                    else l(a, d, f, { passive: !1 });
                });
                if (a.options.draggable && (l(a, "drag", a.onDrag), !a.graphic.renderer.styledMode)) {
                    var d = { cursor: { x: "ew-resize", y: "ns-resize", xy: "move" }[a.options.draggable] };
                    a.graphic.css(d);
                    (a.labels || []).forEach(function (b) {
                        b.options.useHTML && b.graphic.text && b.graphic.text.css(d);
                    });
                }
                a.isUpdating || k(a, "add");
            },
            removeDocEvents: function () {
                this.removeDrag && (this.removeDrag = this.removeDrag());
                this.removeMouseUp && (this.removeMouseUp = this.removeMouseUp());
            },
            onMouseDown: function (a) {
                var b = this,
                    d = b.chart.pointer;
                a.preventDefault && a.preventDefault();
                if (2 !== a.button) {
                    a = d.normalize(a);
                    var f = a.chartX;
                    var g = a.chartY;
                    b.cancelClick = !1;
                    b.chart.hasDraggedAnnotation = !0;
                    b.removeDrag = l(
                        h.doc,
                        h.isTouchDevice ? "touchmove" : "mousemove",
                        function (a) {
                            b.hasDragged = !0;
                            a = d.normalize(a);
                            a.prevChartX = f;
                            a.prevChartY = g;
                            k(b, "drag", a);
                            f = a.chartX;
                            g = a.chartY;
                        },
                        h.isTouchDevice ? { passive: !1 } : void 0
                    );
                    b.removeMouseUp = l(
                        h.doc,
                        h.isTouchDevice ? "touchend" : "mouseup",
                        function (d) {
                            var a = m(b.target && b.target.annotation, b.target);
                            a && (a.cancelClick = b.hasDragged);
                            b.cancelClick = b.hasDragged;
                            b.hasDragged = !1;
                            b.chart.hasDraggedAnnotation = !1;
                            k(m(a, b), "afterUpdate");
                            b.onMouseUp(d);
                        },
                        h.isTouchDevice ? { passive: !1 } : void 0
                    );
                }
            },
            onMouseUp: function (a) {
                var b = this.chart;
                a = this.target || this;
                var d = b.options.annotations;
                b = b.annotations.indexOf(a);
                this.removeDocEvents();
                d[b] = a.options;
            },
            onDrag: function (a) {
                if (this.chart.isInsidePlot(a.chartX - this.chart.plotLeft, a.chartY - this.chart.plotTop, { visiblePlotOnly: !0 })) {
                    var b = this.mouseMoveToTranslation(a);
                    "x" === this.options.draggable && (b.y = 0);
                    "y" === this.options.draggable && (b.x = 0);
                    this.points.length
                        ? this.translate(b.x, b.y)
                        : (this.shapes.forEach(function (d) {
                              d.translate(b.x, b.y);
                          }),
                          this.labels.forEach(function (d) {
                              d.translate(b.x, b.y);
                          }));
                    this.redraw(!1);
                }
            },
            mouseMoveToRadians: function (a, b, d) {
                var f = a.prevChartY - d,
                    g = a.prevChartX - b;
                d = a.chartY - d;
                a = a.chartX - b;
                this.chart.inverted && ((b = g), (g = f), (f = b), (b = a), (a = d), (d = b));
                return Math.atan2(d, a) - Math.atan2(f, g);
            },
            mouseMoveToTranslation: function (a) {
                var b = a.chartX - a.prevChartX;
                a = a.chartY - a.prevChartY;
                if (this.chart.inverted) {
                    var d = a;
                    a = b;
                    b = d;
                }
                return { x: b, y: a };
            },
            mouseMoveToScale: function (a, b, d) {
                b = (a.chartX - b || 1) / (a.prevChartX - b || 1);
                a = (a.chartY - d || 1) / (a.prevChartY - d || 1);
                this.chart.inverted && ((d = a), (a = b), (b = d));
                return { x: b, y: a };
            },
            destroy: function () {
                this.removeDocEvents();
                e(this);
                this.hcEvents = null;
            },
        };
    });
    v(c, "Extensions/Annotations/ControlPoint.js", [c["Core/Utilities.js"], c["Extensions/Annotations/Mixins/EventEmitterMixin.js"]], function (h, c) {
        var l = h.merge,
            k = h.pick;
        return (function () {
            function h(h, e, a, b) {
                this.addEvents = c.addEvents;
                this.graphic = void 0;
                this.mouseMoveToRadians = c.mouseMoveToRadians;
                this.mouseMoveToScale = c.mouseMoveToScale;
                this.mouseMoveToTranslation = c.mouseMoveToTranslation;
                this.onDrag = c.onDrag;
                this.onMouseDown = c.onMouseDown;
                this.onMouseUp = c.onMouseUp;
                this.removeDocEvents = c.removeDocEvents;
                this.nonDOMEvents = ["drag"];
                this.chart = h;
                this.target = e;
                this.options = a;
                this.index = k(a.index, b);
            }
            h.prototype.setVisibility = function (h) {
                this.graphic[h ? "show" : "hide"]();
                this.options.visible = h;
            };
            h.prototype.render = function () {
                var h = this.chart,
                    e = this.options;
                this.graphic = h.renderer.symbol(e.symbol, 0, 0, e.width, e.height).add(h.controlPointsGroup).css(e.style);
                this.setVisibility(e.visible);
                this.addEvents();
            };
            h.prototype.redraw = function (h) {
                this.graphic[h ? "animate" : "attr"](this.options.positioner.call(this, this.target));
            };
            h.prototype.destroy = function () {
                c.destroy.call(this);
                this.graphic && (this.graphic = this.graphic.destroy());
                this.options = this.target = this.chart = null;
            };
            h.prototype.update = function (h) {
                var e = this.chart,
                    a = this.target,
                    b = this.index;
                h = l(!0, this.options, h);
                this.destroy();
                this.constructor(e, a, h, b);
                this.render(e.controlPointsGroup);
                this.redraw();
            };
            return h;
        })();
    });
    v(c, "Extensions/Annotations/MockPoint.js", [c["Core/Series/Series.js"], c["Core/Utilities.js"], c["Core/Axis/Axis.js"]], function (h, c, n) {
        var l = c.defined,
            q = c.fireEvent;
        return (function () {
            function c(e, a, b) {
                this.y = this.x = this.ttBelow = this.plotY = this.plotX = this.negative = this.isInside = void 0;
                this.mock = !0;
                this.series = { visible: !0, chart: e, getPlotBox: h.prototype.getPlotBox };
                this.target = a || null;
                this.options = b;
                this.applyOptions(this.getOptions());
            }
            c.fromPoint = function (e) {
                return new c(e.series.chart, null, { x: e.x, y: e.y, xAxis: e.series.xAxis, yAxis: e.series.yAxis });
            };
            c.pointToPixels = function (e, a) {
                var b = e.series,
                    d = b.chart,
                    f = e.plotX,
                    g = e.plotY;
                d.inverted && (e.mock ? ((f = e.plotY), (g = e.plotX)) : ((f = d.plotWidth - e.plotY), (g = d.plotHeight - e.plotX)));
                b && !a && ((e = b.getPlotBox()), (f += e.translateX), (g += e.translateY));
                return { x: f, y: g };
            };
            c.pointToOptions = function (e) {
                return { x: e.x, y: e.y, xAxis: e.series.xAxis, yAxis: e.series.yAxis };
            };
            c.prototype.hasDynamicOptions = function () {
                return "function" === typeof this.options;
            };
            c.prototype.getOptions = function () {
                return this.hasDynamicOptions() ? this.options(this.target) : this.options;
            };
            c.prototype.applyOptions = function (e) {
                this.command = e.command;
                this.setAxis(e, "x");
                this.setAxis(e, "y");
                this.refresh();
            };
            c.prototype.setAxis = function (e, a) {
                a += "Axis";
                e = e[a];
                var b = this.series.chart;
                this.series[a] = e instanceof n ? e : l(e) ? b[a][e] || b.get(e) : null;
            };
            c.prototype.toAnchor = function () {
                var e = [this.plotX, this.plotY, 0, 0];
                this.series.chart.inverted && ((e[0] = this.plotY), (e[1] = this.plotX));
                return e;
            };
            c.prototype.getLabelConfig = function () {
                return { x: this.x, y: this.y, point: this };
            };
            c.prototype.isInsidePlot = function () {
                var e = this.plotX,
                    a = this.plotY,
                    b = this.series.xAxis,
                    d = this.series.yAxis,
                    f = { x: e, y: a, isInsidePlot: !0 };
                b && (f.isInsidePlot = l(e) && 0 <= e && e <= b.len);
                d && (f.isInsidePlot = f.isInsidePlot && l(a) && 0 <= a && a <= d.len);
                q(this.series.chart, "afterIsInsidePlot", f);
                return f.isInsidePlot;
            };
            c.prototype.refresh = function () {
                var e = this.series,
                    a = e.xAxis;
                e = e.yAxis;
                var b = this.getOptions();
                a ? ((this.x = b.x), (this.plotX = a.toPixels(b.x, !0))) : ((this.x = void 0), (this.plotX = b.x));
                e ? ((this.y = b.y), (this.plotY = e.toPixels(b.y, !0))) : ((this.y = null), (this.plotY = b.y));
                this.isInside = this.isInsidePlot();
            };
            c.prototype.translate = function (e, a, b, d) {
                this.hasDynamicOptions() || ((this.plotX += b), (this.plotY += d), this.refreshOptions());
            };
            c.prototype.scale = function (e, a, b, d) {
                if (!this.hasDynamicOptions()) {
                    var f = this.plotY * d;
                    this.plotX = (1 - b) * e + this.plotX * b;
                    this.plotY = (1 - d) * a + f;
                    this.refreshOptions();
                }
            };
            c.prototype.rotate = function (e, a, b) {
                if (!this.hasDynamicOptions()) {
                    var d = Math.cos(b);
                    b = Math.sin(b);
                    var f = this.plotX,
                        g = this.plotY;
                    f -= e;
                    g -= a;
                    this.plotX = f * d - g * b + e;
                    this.plotY = f * b + g * d + a;
                    this.refreshOptions();
                }
            };
            c.prototype.refreshOptions = function () {
                var e = this.series,
                    a = e.xAxis;
                e = e.yAxis;
                this.x = this.options.x = a ? (this.options.x = a.toValue(this.plotX, !0)) : this.plotX;
                this.y = this.options.y = e ? e.toValue(this.plotY, !0) : this.plotY;
            };
            return c;
        })();
    });
    v(c, "Extensions/Annotations/Mixins/ControllableMixin.js", [c["Extensions/Annotations/ControlPoint.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Tooltip.js"], c["Core/Utilities.js"]], function (h, c, n, k) {
        var l = k.isObject,
            m = k.isString,
            e = k.merge,
            a = k.splat;
        return {
            init: function (b, d, a) {
                this.annotation = b;
                this.chart = b.chart;
                this.options = d;
                this.points = [];
                this.controlPoints = [];
                this.index = a;
                this.linkPoints();
                this.addControlPoints();
            },
            attr: function () {
                this.graphic.attr.apply(this.graphic, arguments);
            },
            getPointsOptions: function () {
                var b = this.options;
                return b.points || (b.point && a(b.point));
            },
            attrsFromOptions: function (b) {
                var d = this.constructor.attrsMap,
                    a = {},
                    g,
                    r = this.chart.styledMode;
                for (g in b) {
                    var e = d[g];
                    !e || (r && -1 !== ["fill", "stroke", "stroke-width"].indexOf(e)) || (a[e] = b[g]);
                }
                return a;
            },
            anchor: function (b) {
                var d = b.series.getPlotBox(),
                    a = b.series.chart,
                    g = b.mock ? b.toAnchor() : n.prototype.getAnchor.call({ chart: b.series.chart }, b);
                g = { x: g[0] + (this.options.x || 0), y: g[1] + (this.options.y || 0), height: g[2] || 0, width: g[3] || 0 };
                return { relativePosition: g, absolutePosition: e(g, { x: g.x + (b.mock ? d.translateX : a.plotLeft), y: g.y + (b.mock ? d.translateY : a.plotTop) }) };
            },
            point: function (b, d) {
                if (b && b.series) return b;
                (d && null !== d.series) || (l(b) ? (d = new c(this.chart, this, b)) : m(b) ? (d = this.chart.get(b) || null) : "function" === typeof b && ((d = b.call(d, this)), (d = d.series ? d : new c(this.chart, this, b))));
                return d;
            },
            linkPoints: function () {
                var b = this.getPointsOptions(),
                    d = this.points,
                    a = (b && b.length) || 0,
                    g;
                for (g = 0; g < a; g++) {
                    var r = this.point(b[g], d[g]);
                    if (!r) {
                        d.length = 0;
                        return;
                    }
                    r.mock && r.refresh();
                    d[g] = r;
                }
                return d;
            },
            addControlPoints: function () {
                var b = this.options.controlPoints;
                (b || []).forEach(function (d, a) {
                    d = e(this.options.controlPointOptions, d);
                    d.index || (d.index = a);
                    b[a] = d;
                    this.controlPoints.push(new h(this.chart, this, d));
                }, this);
            },
            shouldBeDrawn: function () {
                return !!this.points.length;
            },
            render: function (b) {
                this.controlPoints.forEach(function (b) {
                    b.render();
                });
            },
            redraw: function (b) {
                this.controlPoints.forEach(function (d) {
                    d.redraw(b);
                });
            },
            transform: function (b, d, a, g, r) {
                if (this.chart.inverted) {
                    var f = d;
                    d = a;
                    a = f;
                }
                this.points.forEach(function (f, e) {
                    this.transformPoint(b, d, a, g, r, e);
                }, this);
            },
            transformPoint: function (b, d, a, g, r, e) {
                var f = this.points[e];
                f.mock || (f = this.points[e] = c.fromPoint(f));
                f[b](d, a, g, r);
            },
            translate: function (b, a) {
                this.transform("translate", null, null, b, a);
            },
            translatePoint: function (b, a, f) {
                this.transformPoint("translate", null, null, b, a, f);
            },
            translateShape: function (b, a, f) {
                var d = this.annotation.chart,
                    r = this.annotation.userOptions,
                    e = d.annotations.indexOf(this.annotation);
                d = d.options.annotations[e];
                this.translatePoint(b, a, 0);
                f && this.translatePoint(b, a, 1);
                d[this.collection][this.index].point = this.options.point;
                r[this.collection][this.index].point = this.options.point;
            },
            rotate: function (b, a, f) {
                this.transform("rotate", b, a, f);
            },
            scale: function (b, a, f, g) {
                this.transform("scale", b, a, f, g);
            },
            setControlPointsVisibility: function (b) {
                this.controlPoints.forEach(function (a) {
                    a.setVisibility(b);
                });
            },
            destroy: function () {
                this.graphic && (this.graphic = this.graphic.destroy());
                this.tracker && (this.tracker = this.tracker.destroy());
                this.controlPoints.forEach(function (b) {
                    b.destroy();
                });
                this.options = this.controlPoints = this.points = this.chart = null;
                this.annotation && (this.annotation = null);
            },
            update: function (b) {
                var a = this.annotation;
                b = e(!0, this.options, b);
                var f = this.graphic.parentGroup;
                this.destroy();
                this.constructor(a, b, this.index);
                this.render(f);
                this.redraw();
            },
        };
    });
    v(c, "Extensions/Annotations/Mixins/MarkerMixin.js", [c["Core/Chart/Chart.js"], c["Core/Renderer/SVG/SVGRenderer.js"], c["Core/Utilities.js"]], function (h, c, n) {
        function l(b) {
            return function (a) {
                this.attr(b, "url(#" + a + ")");
            };
        }
        var q = n.addEvent,
            m = n.defined,
            e = n.merge,
            a = n.uniqueKey,
            b = {
                arrow: { tagName: "marker", attributes: { id: "arrow", refY: 5, refX: 9, markerWidth: 10, markerHeight: 10 }, children: [{ tagName: "path", attributes: { d: "M 0 0 L 10 5 L 0 10 Z", "stroke-width": 0 } }] },
                "reverse-arrow": {
                    tagName: "marker",
                    attributes: { id: "reverse-arrow", refY: 5, refX: 1, markerWidth: 10, markerHeight: 10 },
                    children: [{ tagName: "path", attributes: { d: "M 0 5 L 10 0 L 10 10 Z", "stroke-width": 0 } }],
                },
            };
        c.prototype.addMarker = function (b, a) {
            var d = { attributes: { id: b } },
                f = { stroke: a.color || "none", fill: a.color || "rgba(0, 0, 0, 0.75)" };
            d.children =
                a.children &&
                a.children.map(function (a) {
                    return e(f, a);
                });
            a = e(!0, { attributes: { markerWidth: 20, markerHeight: 20, refX: 0, refY: 0, orient: "auto" } }, a, d);
            a = this.definition(a);
            a.id = b;
            return a;
        };
        c = {
            markerEndSetter: l("marker-end"),
            markerStartSetter: l("marker-start"),
            setItemMarkers: function (b) {
                var d = b.options,
                    g = b.chart,
                    r = g.options.defs,
                    p = d.fill,
                    h = m(p) && "none" !== p ? p : d.stroke;
                ["markerStart", "markerEnd"].forEach(function (f) {
                    var p = d[f],
                        c;
                    if (p) {
                        for (c in r) {
                            var u = r[c];
                            if ((p === (u.attributes && u.attributes.id) || p === u.id) && "marker" === u.tagName) {
                                var G = u;
                                break;
                            }
                        }
                        G && ((p = b[f] = g.renderer.addMarker((d.id || a()) + "-" + p, e(G, { color: h }))), b.attr(f, p.getAttribute("id")));
                    }
                });
            },
        };
        q(h, "afterGetContainer", function () {
            this.options.defs = e(b, this.options.defs || {});
        });
        return c;
    });
    v(c, "Extensions/Annotations/Controllables/ControllablePath.js", [c["Extensions/Annotations/Mixins/ControllableMixin.js"], c["Core/Globals.js"], c["Extensions/Annotations/Mixins/MarkerMixin.js"], c["Core/Utilities.js"]], function (
        h,
        c,
        n,
        k
    ) {
        var l = k.extend,
            m = "rgba(192,192,192," + (c.svg ? 0.0001 : 0.002) + ")";
        return (function () {
            function e(a, b, d) {
                this.addControlPoints = h.addControlPoints;
                this.anchor = h.anchor;
                this.attr = h.attr;
                this.attrsFromOptions = h.attrsFromOptions;
                this.destroy = h.destroy;
                this.getPointsOptions = h.getPointsOptions;
                this.init = h.init;
                this.linkPoints = h.linkPoints;
                this.point = h.point;
                this.rotate = h.rotate;
                this.scale = h.scale;
                this.setControlPointsVisibility = h.setControlPointsVisibility;
                this.setMarkers = n.setItemMarkers;
                this.transform = h.transform;
                this.transformPoint = h.transformPoint;
                this.translate = h.translate;
                this.translatePoint = h.translatePoint;
                this.translateShape = h.translateShape;
                this.update = h.update;
                this.type = "path";
                this.init(a, b, d);
                this.collection = "shapes";
            }
            e.prototype.toD = function () {
                var a = this.options.d;
                if (a) return "function" === typeof a ? a.call(this) : a;
                a = this.points;
                var b = a.length,
                    d = b,
                    f = a[0],
                    g = d && this.anchor(f).absolutePosition,
                    r = 0,
                    e = [];
                if (g)
                    for (e.push(["M", g.x, g.y]); ++r < b && d; )
                        (f = a[r]), (d = f.command || "L"), (g = this.anchor(f).absolutePosition), "M" === d ? e.push([d, g.x, g.y]) : "L" === d ? e.push([d, g.x, g.y]) : "Z" === d && e.push([d]), (d = f.series.visible);
                return d ? this.chart.renderer.crispLine(e, this.graphic.strokeWidth()) : null;
            };
            e.prototype.shouldBeDrawn = function () {
                return h.shouldBeDrawn.call(this) || !!this.options.d;
            };
            e.prototype.render = function (a) {
                var b = this.options,
                    d = this.attrsFromOptions(b);
                this.graphic = this.annotation.chart.renderer
                    .path([["M", 0, 0]])
                    .attr(d)
                    .add(a);
                b.className && this.graphic.addClass(b.className);
                this.tracker = this.annotation.chart.renderer
                    .path([["M", 0, 0]])
                    .addClass("highcharts-tracker-line")
                    .attr({ zIndex: 2 })
                    .add(a);
                this.annotation.chart.styledMode || this.tracker.attr({ "stroke-linejoin": "round", stroke: m, fill: m, "stroke-width": this.graphic.strokeWidth() + 2 * b.snap });
                h.render.call(this);
                l(this.graphic, { markerStartSetter: n.markerStartSetter, markerEndSetter: n.markerEndSetter });
                this.setMarkers(this);
            };
            e.prototype.redraw = function (a) {
                var b = this.toD(),
                    d = a ? "animate" : "attr";
                b ? (this.graphic[d]({ d: b }), this.tracker[d]({ d: b })) : (this.graphic.attr({ d: "M 0 -9000000000" }), this.tracker.attr({ d: "M 0 -9000000000" }));
                this.graphic.placed = this.tracker.placed = !!b;
                h.redraw.call(this, a);
            };
            e.attrsMap = { dashStyle: "dashstyle", strokeWidth: "stroke-width", stroke: "stroke", fill: "fill", zIndex: "zIndex" };
            return e;
        })();
    });
    v(c, "Extensions/Annotations/Controllables/ControllableRect.js", [c["Extensions/Annotations/Mixins/ControllableMixin.js"], c["Extensions/Annotations/Controllables/ControllablePath.js"], c["Core/Utilities.js"]], function (h, c, n) {
        var l = n.merge;
        return (function () {
            function k(c, e, a) {
                this.addControlPoints = h.addControlPoints;
                this.anchor = h.anchor;
                this.attr = h.attr;
                this.attrsFromOptions = h.attrsFromOptions;
                this.destroy = h.destroy;
                this.getPointsOptions = h.getPointsOptions;
                this.init = h.init;
                this.linkPoints = h.linkPoints;
                this.point = h.point;
                this.rotate = h.rotate;
                this.scale = h.scale;
                this.setControlPointsVisibility = h.setControlPointsVisibility;
                this.shouldBeDrawn = h.shouldBeDrawn;
                this.transform = h.transform;
                this.transformPoint = h.transformPoint;
                this.translatePoint = h.translatePoint;
                this.translateShape = h.translateShape;
                this.update = h.update;
                this.type = "rect";
                this.translate = h.translateShape;
                this.init(c, e, a);
                this.collection = "shapes";
            }
            k.prototype.render = function (c) {
                var e = this.attrsFromOptions(this.options);
                this.graphic = this.annotation.chart.renderer.rect(0, -9e9, 0, 0).attr(e).add(c);
                h.render.call(this);
            };
            k.prototype.redraw = function (c) {
                var e = this.anchor(this.points[0]).absolutePosition;
                if (e) this.graphic[c ? "animate" : "attr"]({ x: e.x, y: e.y, width: this.options.width, height: this.options.height });
                else this.attr({ x: 0, y: -9e9 });
                this.graphic.placed = !!e;
                h.redraw.call(this, c);
            };
            k.attrsMap = l(c.attrsMap, { width: "width", height: "height" });
            return k;
        })();
    });
    v(c, "Extensions/Annotations/Controllables/ControllableCircle.js", [c["Extensions/Annotations/Mixins/ControllableMixin.js"], c["Extensions/Annotations/Controllables/ControllablePath.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h = n.merge;
        return (function () {
            function k(h, e, a) {
                this.addControlPoints = c.addControlPoints;
                this.anchor = c.anchor;
                this.attr = c.attr;
                this.attrsFromOptions = c.attrsFromOptions;
                this.destroy = c.destroy;
                this.getPointsOptions = c.getPointsOptions;
                this.init = c.init;
                this.linkPoints = c.linkPoints;
                this.point = c.point;
                this.rotate = c.rotate;
                this.scale = c.scale;
                this.setControlPointsVisibility = c.setControlPointsVisibility;
                this.shouldBeDrawn = c.shouldBeDrawn;
                this.transform = c.transform;
                this.transformPoint = c.transformPoint;
                this.translatePoint = c.translatePoint;
                this.translateShape = c.translateShape;
                this.update = c.update;
                this.type = "circle";
                this.translate = c.translateShape;
                this.init(h, e, a);
                this.collection = "shapes";
            }
            k.prototype.render = function (h) {
                var e = this.attrsFromOptions(this.options);
                this.graphic = this.annotation.chart.renderer.circle(0, -9e9, 0).attr(e).add(h);
                c.render.call(this);
            };
            k.prototype.redraw = function (h) {
                var e = this.anchor(this.points[0]).absolutePosition;
                if (e) this.graphic[h ? "animate" : "attr"]({ x: e.x, y: e.y, r: this.options.r });
                else this.graphic.attr({ x: 0, y: -9e9 });
                this.graphic.placed = !!e;
                c.redraw.call(this, h);
            };
            k.prototype.setRadius = function (c) {
                this.options.r = c;
            };
            k.attrsMap = h(l.attrsMap, { r: "r" });
            return k;
        })();
    });
    v(c, "Extensions/Annotations/Controllables/ControllableEllipse.js", [c["Extensions/Annotations/Mixins/ControllableMixin.js"], c["Extensions/Annotations/Controllables/ControllablePath.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h = n.merge,
            q = n.defined;
        return (function () {
            function m(e, a, b) {
                this.addControlPoints = c.addControlPoints;
                this.anchor = c.anchor;
                this.attr = c.attr;
                this.attrsFromOptions = c.attrsFromOptions;
                this.destroy = c.destroy;
                this.getPointsOptions = c.getPointsOptions;
                this.linkPoints = c.linkPoints;
                this.point = c.point;
                this.scale = c.scale;
                this.setControlPointsVisibility = c.setControlPointsVisibility;
                this.shouldBeDrawn = c.shouldBeDrawn;
                this.transform = c.transform;
                this.translatePoint = c.translatePoint;
                this.transformPoint = c.transformPoint;
                this.type = "ellipse";
                this.init(e, a, b);
                this.collection = "shapes";
            }
            m.prototype.init = function (e, a, b) {
                q(a.yAxis) &&
                    a.points.forEach(function (b) {
                        b.yAxis = a.yAxis;
                    });
                q(a.xAxis) &&
                    a.points.forEach(function (b) {
                        b.xAxis = a.xAxis;
                    });
                c.init.call(this, e, a, b);
            };
            m.prototype.render = function (e) {
                this.graphic = this.annotation.chart.renderer.createElement("ellipse").attr(this.attrsFromOptions(this.options)).add(e);
                c.render.call(this);
            };
            m.prototype.translate = function (e, a) {
                c.translateShape.call(this, e, a, !0);
            };
            m.prototype.getDistanceFromLine = function (e, a, b, d) {
                return Math.abs((a.y - e.y) * b - (a.x - e.x) * d + a.x * e.y - a.y * e.x) / Math.sqrt((a.y - e.y) * (a.y - e.y) + (a.x - e.x) * (a.x - e.x));
            };
            m.prototype.getAttrs = function (e, a) {
                var b = e.x,
                    d = e.y,
                    f = a.x,
                    g = a.y;
                a = (b + f) / 2;
                e = (d + g) / 2;
                var r = Math.sqrt(((b - f) * (b - f)) / 4 + ((d - g) * (d - g)) / 4);
                d = (180 * Math.atan((g - d) / (f - b))) / Math.PI;
                a < b && (d += 180);
                b = this.getRY();
                return { cx: a, cy: e, rx: r, ry: b, angle: d };
            };
            m.prototype.getRY = function () {
                var e = this.getYAxis();
                return q(e) ? Math.abs(e.toPixels(this.options.ry) - e.toPixels(0)) : this.options.ry;
            };
            m.prototype.getYAxis = function () {
                return this.chart.yAxis[this.options.yAxis];
            };
            m.prototype.getAbsolutePosition = function (e) {
                return this.anchor(e).absolutePosition;
            };
            m.prototype.redraw = function (e) {
                var a = this.getAbsolutePosition(this.points[0]),
                    b = this.getAbsolutePosition(this.points[1]);
                b = this.getAttrs(a, b);
                if (a) this.graphic[e ? "animate" : "attr"]({ cx: b.cx, cy: b.cy, rx: b.rx, ry: b.ry, rotation: b.angle, rotationOriginX: b.cx, rotationOriginY: b.cy });
                else this.graphic.attr({ x: 0, y: -9e9 });
                this.graphic.placed = !!a;
                c.redraw.call(this, e);
            };
            m.prototype.setYRadius = function (e) {
                var a = this.annotation.userOptions.shapes;
                this.options.ry = e;
                a && a[0] && ((a[0].ry = e), (a[0].ry = e));
            };
            m.attrsMap = h(l.attrsMap, { ry: "ry" });
            return m;
        })();
    });
    v(
        c,
        "Extensions/Annotations/Controllables/ControllableLabel.js",
        [c["Extensions/Annotations/Mixins/ControllableMixin.js"], c["Core/FormatUtilities.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Renderer/SVG/SVGRenderer.js"], c["Core/Tooltip.js"], c["Core/Utilities.js"]],
        function (c, l, n, k, q, m) {
            var e = l.format;
            l = k.prototype.symbols;
            var a = m.extend,
                b = m.isNumber,
                d = m.pick;
            m = (function () {
                function b(b, a, d) {
                    this.addControlPoints = c.addControlPoints;
                    this.attr = c.attr;
                    this.attrsFromOptions = c.attrsFromOptions;
                    this.destroy = c.destroy;
                    this.getPointsOptions = c.getPointsOptions;
                    this.init = c.init;
                    this.linkPoints = c.linkPoints;
                    this.point = c.point;
                    this.rotate = c.rotate;
                    this.scale = c.scale;
                    this.setControlPointsVisibility = c.setControlPointsVisibility;
                    this.shouldBeDrawn = c.shouldBeDrawn;
                    this.transform = c.transform;
                    this.transformPoint = c.transformPoint;
                    this.translateShape = c.translateShape;
                    this.update = c.update;
                    this.init(b, a, d);
                    this.collection = "labels";
                }
                b.alignedPosition = function (b, a) {
                    var d = b.align,
                        r = b.verticalAlign,
                        f = (a.x || 0) + (b.x || 0),
                        g = (a.y || 0) + (b.y || 0),
                        e,
                        c;
                    "right" === d ? (e = 1) : "center" === d && (e = 2);
                    e && (f += (a.width - (b.width || 0)) / e);
                    "bottom" === r ? (c = 1) : "middle" === r && (c = 2);
                    c && (g += (a.height - (b.height || 0)) / c);
                    return { x: Math.round(f), y: Math.round(g) };
                };
                b.justifiedOptions = function (b, a, d, f) {
                    var g = d.align,
                        r = d.verticalAlign,
                        e = a.box ? 0 : a.padding || 0,
                        c = a.getBBox();
                    a = { align: g, verticalAlign: r, x: d.x, y: d.y, width: a.width, height: a.height };
                    d = (f.x || 0) - b.plotLeft;
                    f = (f.y || 0) - b.plotTop;
                    var p = d + e;
                    0 > p && ("right" === g ? (a.align = "left") : (a.x = (a.x || 0) - p));
                    p = d + c.width - e;
                    p > b.plotWidth && ("left" === g ? (a.align = "right") : (a.x = (a.x || 0) + b.plotWidth - p));
                    p = f + e;
                    0 > p && ("bottom" === r ? (a.verticalAlign = "top") : (a.y = (a.y || 0) - p));
                    p = f + c.height - e;
                    p > b.plotHeight && ("top" === r ? (a.verticalAlign = "bottom") : (a.y = (a.y || 0) + b.plotHeight - p));
                    return a;
                };
                b.prototype.translatePoint = function (b, a) {
                    c.translatePoint.call(this, b, a, 0);
                };
                b.prototype.translate = function (b, a) {
                    var d = this.annotation.chart,
                        f = this.annotation.userOptions,
                        g = d.annotations.indexOf(this.annotation);
                    g = d.options.annotations[g];
                    d.inverted && ((d = b), (b = a), (a = d));
                    this.options.x += b;
                    this.options.y += a;
                    g[this.collection][this.index].x = this.options.x;
                    g[this.collection][this.index].y = this.options.y;
                    f[this.collection][this.index].x = this.options.x;
                    f[this.collection][this.index].y = this.options.y;
                };
                b.prototype.render = function (a) {
                    var d = this.options,
                        f = this.attrsFromOptions(d),
                        g = d.style;
                    this.graphic = this.annotation.chart.renderer.label("", 0, -9999, d.shape, null, null, d.useHTML, null, "annotation-label").attr(f).add(a);
                    this.annotation.chart.styledMode ||
                        ("contrast" === g.color && (g.color = this.annotation.chart.renderer.getContrast(-1 < b.shapesWithoutBackground.indexOf(d.shape) ? "#FFFFFF" : d.backgroundColor)), this.graphic.css(d.style).shadow(d.shadow));
                    d.className && this.graphic.addClass(d.className);
                    this.graphic.labelrank = d.labelrank;
                    c.render.call(this);
                };
                b.prototype.redraw = function (b) {
                    var a = this.options,
                        d = this.text || a.format || a.text,
                        f = this.graphic,
                        g = this.points[0];
                    f.attr({ text: d ? e(d, g.getLabelConfig(), this.annotation.chart) : a.formatter.call(g, this) });
                    a = this.anchor(g);
                    (d = this.position(a)) ? ((f.alignAttr = d), (d.anchorX = a.absolutePosition.x), (d.anchorY = a.absolutePosition.y), f[b ? "animate" : "attr"](d)) : f.attr({ x: 0, y: -9999 });
                    f.placed = !!d;
                    c.redraw.call(this, b);
                };
                b.prototype.anchor = function (b) {
                    var a = c.anchor.apply(this, arguments),
                        d = this.options.x || 0,
                        f = this.options.y || 0;
                    a.absolutePosition.x -= d;
                    a.absolutePosition.y -= f;
                    a.relativePosition.x -= d;
                    a.relativePosition.y -= f;
                    return a;
                };
                b.prototype.position = function (f) {
                    var g = this.graphic,
                        e = this.annotation.chart,
                        c = this.points[0],
                        h = this.options,
                        l = f.absolutePosition,
                        m = f.relativePosition,
                        k = c.series.visible && n.prototype.isInsidePlot.call(c);
                    f = g.width;
                    f = void 0 === f ? 0 : f;
                    var y = g.height;
                    y = void 0 === y ? 0 : y;
                    if (k) {
                        if (h.distance) var B = q.prototype.getPosition.call({ chart: e, distance: d(h.distance, 16) }, f, y, { plotX: m.x, plotY: m.y, negative: c.negative, ttBelow: c.ttBelow, h: m.height || m.width });
                        else
                            h.positioner
                                ? (B = h.positioner.call(this))
                                : ((c = { x: l.x, y: l.y, width: 0, height: 0 }), (B = b.alignedPosition(a(h, { width: f, height: y }), c)), "justify" === this.options.overflow && (B = b.alignedPosition(b.justifiedOptions(e, g, h, B), c)));
                        h.crop && ((g = B.x - e.plotLeft), (h = B.y - e.plotTop), (k = e.isInsidePlot(g, h) && e.isInsidePlot(g + f, h + y)));
                    }
                    return k ? B : null;
                };
                b.attrsMap = { backgroundColor: "fill", borderColor: "stroke", borderWidth: "stroke-width", zIndex: "zIndex", borderRadius: "r", padding: "padding" };
                b.shapesWithoutBackground = ["connector"];
                return b;
            })();
            l.connector = function (a, d, e, c, u) {
                var f = u && u.anchorX;
                u = u && u.anchorY;
                var g = e / 2;
                if (b(f) && b(u)) {
                    var r = [["M", f, u]];
                    var p = d - u;
                    0 > p && (p = -c - p);
                    p < e && (g = f < a + e / 2 ? p : e - p);
                    u > d + c ? r.push(["L", a + g, d + c]) : u < d ? r.push(["L", a + g, d]) : f < a ? r.push(["L", a, d + c / 2]) : f > a + e && r.push(["L", a + e, d + c / 2]);
                }
                return r || [];
            };
            return m;
        }
    );
    v(c, "Extensions/Annotations/Controllables/ControllableImage.js", [c["Extensions/Annotations/Controllables/ControllableLabel.js"], c["Extensions/Annotations/Mixins/ControllableMixin.js"]], function (c, l) {
        return (function () {
            function h(c, h, m) {
                this.addControlPoints = l.addControlPoints;
                this.anchor = l.anchor;
                this.attr = l.attr;
                this.attrsFromOptions = l.attrsFromOptions;
                this.destroy = l.destroy;
                this.getPointsOptions = l.getPointsOptions;
                this.init = l.init;
                this.linkPoints = l.linkPoints;
                this.point = l.point;
                this.rotate = l.rotate;
                this.scale = l.scale;
                this.setControlPointsVisibility = l.setControlPointsVisibility;
                this.shouldBeDrawn = l.shouldBeDrawn;
                this.transform = l.transform;
                this.transformPoint = l.transformPoint;
                this.translatePoint = l.translatePoint;
                this.translateShape = l.translateShape;
                this.update = l.update;
                this.type = "image";
                this.translate = l.translateShape;
                this.init(c, h, m);
                this.collection = "shapes";
            }
            h.prototype.render = function (c) {
                var h = this.attrsFromOptions(this.options),
                    m = this.options;
                this.graphic = this.annotation.chart.renderer.image(m.src, 0, -9e9, m.width, m.height).attr(h).add(c);
                this.graphic.width = m.width;
                this.graphic.height = m.height;
                l.render.call(this);
            };
            h.prototype.redraw = function (h) {
                var k = this.anchor(this.points[0]);
                if ((k = c.prototype.position.call(this, k))) this.graphic[h ? "animate" : "attr"]({ x: k.x, y: k.y });
                else this.graphic.attr({ x: 0, y: -9e9 });
                this.graphic.placed = !!k;
                l.redraw.call(this, h);
            };
            h.attrsMap = { width: "width", height: "height", zIndex: "zIndex" };
            return h;
        })();
    });
    v(
        c,
        "Extensions/Annotations/Annotation.js",
        [
            c["Core/Animation/AnimationUtilities.js"],
            c["Core/Chart/Chart.js"],
            c["Extensions/Annotations/Mixins/ControllableMixin.js"],
            c["Extensions/Annotations/Controllables/ControllableRect.js"],
            c["Extensions/Annotations/Controllables/ControllableCircle.js"],
            c["Extensions/Annotations/Controllables/ControllableEllipse.js"],
            c["Extensions/Annotations/Controllables/ControllablePath.js"],
            c["Extensions/Annotations/Controllables/ControllableImage.js"],
            c["Extensions/Annotations/Controllables/ControllableLabel.js"],
            c["Extensions/Annotations/ControlPoint.js"],
            c["Extensions/Annotations/Mixins/EventEmitterMixin.js"],
            c["Core/Globals.js"],
            c["Extensions/Annotations/MockPoint.js"],
            c["Core/Pointer.js"],
            c["Core/Utilities.js"],
        ],
        function (c, l, n, k, q, m, e, a, b, d, f, g, r, p, u) {
            var h = c.getDeferredAnimation;
            c = l.prototype;
            var C = u.addEvent,
                D = u.defined,
                A = u.destroyObjectProperties,
                y = u.erase,
                B = u.extend,
                E = u.find,
                x = u.fireEvent,
                t = u.merge,
                w = u.pick,
                z = u.splat;
            u = u.wrap;
            var F = (function () {
                function g(a, b) {
                    this.annotation = void 0;
                    this.coll = "annotations";
                    this.shapesGroup = this.labelsGroup = this.labelCollector = this.group = this.graphic = this.animationConfig = this.collection = void 0;
                    this.chart = a;
                    this.points = [];
                    this.controlPoints = [];
                    this.coll = "annotations";
                    this.labels = [];
                    this.shapes = [];
                    this.options = t(this.defaultOptions, b);
                    this.userOptions = b;
                    b = this.getLabelsAndShapesOptions(this.options, b);
                    this.options.labels = b.labels;
                    this.options.shapes = b.shapes;
                    this.init(a, this.options);
                }
                g.prototype.init = function () {
                    var a = this.chart,
                        b = this.options.animation;
                    this.linkPoints();
                    this.addControlPoints();
                    this.addShapes();
                    this.addLabels();
                    this.setLabelCollector();
                    this.animationConfig = h(a, b);
                };
                g.prototype.getLabelsAndShapesOptions = function (a, b) {
                    var d = {};
                    ["labels", "shapes"].forEach(function (f) {
                        var g = a[f];
                        g &&
                            (d[f] = b[f]
                                ? z(b[f]).map(function (a, b) {
                                      return t(g[b], a);
                                  })
                                : a[f]);
                    });
                    return d;
                };
                g.prototype.addShapes = function () {
                    var a = this.options.shapes || [];
                    a.forEach(function (b, d) {
                        b = this.initShape(b, d);
                        t(!0, a[d], b.options);
                    }, this);
                };
                g.prototype.addLabels = function () {
                    (this.options.labels || []).forEach(function (a, b) {
                        a = this.initLabel(a, b);
                        t(!0, this.options.labels[b], a.options);
                    }, this);
                };
                g.prototype.addClipPaths = function () {
                    this.setClipAxes();
                    this.clipXAxis && this.clipYAxis && this.options.crop && (this.clipRect = this.chart.renderer.clipRect(this.getClipBox()));
                };
                g.prototype.setClipAxes = function () {
                    var a = this.chart.xAxis,
                        b = this.chart.yAxis,
                        d = (this.options.labels || []).concat(this.options.shapes || []).reduce(function (d, f) {
                            f = f && (f.point || (f.points && f.points[0]));
                            return [a[f && f.xAxis] || d[0], b[f && f.yAxis] || d[1]];
                        }, []);
                    this.clipXAxis = d[0];
                    this.clipYAxis = d[1];
                };
                g.prototype.getClipBox = function () {
                    if (this.clipXAxis && this.clipYAxis) return { x: this.clipXAxis.left, y: this.clipYAxis.top, width: this.clipXAxis.width, height: this.clipYAxis.height };
                };
                g.prototype.setLabelCollector = function () {
                    var a = this;
                    a.labelCollector = function () {
                        return a.labels.reduce(function (a, b) {
                            b.options.allowOverlap || a.push(b.graphic);
                            return a;
                        }, []);
                    };
                    a.chart.labelCollectors.push(a.labelCollector);
                };
                g.prototype.setOptions = function (a) {
                    this.options = t(this.defaultOptions, a);
                };
                g.prototype.redraw = function (a) {
                    this.linkPoints();
                    this.graphic || this.render();
                    this.clipRect && this.clipRect.animate(this.getClipBox());
                    this.redrawItems(this.shapes, a);
                    this.redrawItems(this.labels, a);
                    n.redraw.call(this, a);
                };
                g.prototype.redrawItems = function (a, b) {
                    for (var d = a.length; d--; ) this.redrawItem(a[d], b);
                };
                g.prototype.renderItems = function (a) {
                    for (var b = a.length; b--; ) this.renderItem(a[b]);
                };
                g.prototype.render = function () {
                    var a = this.chart.renderer;
                    this.graphic = a
                        .g("annotation")
                        .attr({ opacity: 0, zIndex: this.options.zIndex, visibility: this.options.visible ? "inherit" : "hidden" })
                        .add();
                    this.shapesGroup = a.g("annotation-shapes").add(this.graphic);
                    this.options.crop && this.shapesGroup.clip(this.chart.plotBoxClip);
                    this.labelsGroup = a.g("annotation-labels").attr({ translateX: 0, translateY: 0 }).add(this.graphic);
                    this.addClipPaths();
                    this.clipRect && this.graphic.clip(this.clipRect);
                    this.renderItems(this.shapes);
                    this.renderItems(this.labels);
                    this.addEvents();
                    n.render.call(this);
                };
                g.prototype.setVisibility = function (a) {
                    var b = this.options,
                        d = this.chart.navigationBindings;
                    a = w(a, !b.visible);
                    this.graphic.attr("visibility", a ? "inherit" : "hidden");
                    a || (this.setControlPointsVisibility(!1), d.activeAnnotation === this && d.popup && "annotation-toolbar" === d.popup.formType && x(d, "closePopup"));
                    b.visible = a;
                };
                g.prototype.setControlPointsVisibility = function (a) {
                    var b = function (b) {
                        b.setControlPointsVisibility(a);
                    };
                    n.setControlPointsVisibility.call(this, a);
                    this.shapes.forEach(b);
                    this.labels.forEach(b);
                };
                g.prototype.destroy = function () {
                    var a = this.chart,
                        b = function (a) {
                            a.destroy();
                        };
                    this.labels.forEach(b);
                    this.shapes.forEach(b);
                    this.clipYAxis = this.clipXAxis = null;
                    y(a.labelCollectors, this.labelCollector);
                    f.destroy.call(this);
                    n.destroy.call(this);
                    A(this, a);
                };
                g.prototype.remove = function () {
                    return this.chart.removeAnnotation(this);
                };
                g.prototype.update = function (a, b) {
                    var d = this.chart,
                        f = this.getLabelsAndShapesOptions(this.userOptions, a),
                        g = d.annotations.indexOf(this);
                    a = t(!0, this.userOptions, a);
                    a.labels = f.labels;
                    a.shapes = f.shapes;
                    this.destroy();
                    this.constructor(d, a);
                    d.options.annotations[g] = a;
                    this.isUpdating = !0;
                    w(b, !0) && d.redraw();
                    x(this, "afterUpdate");
                    this.isUpdating = !1;
                };
                g.prototype.initShape = function (a, b) {
                    a = t(this.options.shapeOptions, { controlPointOptions: this.options.controlPointOptions }, a);
                    b = new g.shapesMap[a.type](this, a, b);
                    b.itemType = "shape";
                    this.shapes.push(b);
                    return b;
                };
                g.prototype.initLabel = function (a, d) {
                    a = t(this.options.labelOptions, { controlPointOptions: this.options.controlPointOptions }, a);
                    d = new b(this, a, d);
                    d.itemType = "label";
                    this.labels.push(d);
                    return d;
                };
                g.prototype.redrawItem = function (a, b) {
                    a.linkPoints();
                    a.shouldBeDrawn() ? (a.graphic || this.renderItem(a), a.redraw(w(b, !0) && a.graphic.placed), a.points.length && this.adjustVisibility(a)) : this.destroyItem(a);
                };
                g.prototype.adjustVisibility = function (a) {
                    var b = !1,
                        d = a.graphic;
                    a.points.forEach(function (a) {
                        !1 !== a.series.visible && !1 !== a.visible && (b = !0);
                    });
                    b ? "hidden" === d.visibility && d.show() : d.hide();
                };
                g.prototype.destroyItem = function (a) {
                    y(this[a.itemType + "s"], a);
                    a.destroy();
                };
                g.prototype.renderItem = function (a) {
                    a.render("label" === a.itemType ? this.labelsGroup : this.shapesGroup);
                };
                g.ControlPoint = d;
                g.MockPoint = r;
                g.shapesMap = { rect: k, circle: q, ellipse: m, path: e, image: a };
                g.types = {};
                return g;
            })();
            t(
                !0,
                F.prototype,
                n,
                f,
                t(F.prototype, {
                    nonDOMEvents: ["add", "afterUpdate", "drag", "remove"],
                    defaultOptions: {
                        visible: !0,
                        animation: {},
                        crop: !0,
                        draggable: "xy",
                        labelOptions: {
                            align: "center",
                            allowOverlap: !1,
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                            borderColor: "#000000",
                            borderRadius: 3,
                            borderWidth: 1,
                            className: "highcharts-no-tooltip",
                            crop: !1,
                            formatter: function () {
                                return D(this.y) ? this.y : "Annotation label";
                            },
                            includeInDataExport: !0,
                            overflow: "justify",
                            padding: 5,
                            shadow: !1,
                            shape: "callout",
                            style: { fontSize: "11px", fontWeight: "normal", color: "contrast" },
                            useHTML: !1,
                            verticalAlign: "bottom",
                            x: 0,
                            y: -16,
                        },
                        shapeOptions: { stroke: "rgba(0, 0, 0, 0.75)", strokeWidth: 1, fill: "rgba(0, 0, 0, 0.75)", r: 0, snap: 2 },
                        controlPointOptions: { symbol: "circle", width: 10, height: 10, style: { cursor: "pointer", fill: "#ffffff", stroke: "#000000", "stroke-width": 2 }, visible: !1, events: {} },
                        events: {},
                        zIndex: 6,
                    },
                })
            );
            g.extendAnnotation = function (a, b, d, f) {
                b = b || F;
                B(a.prototype, t(b.prototype, d));
                a.prototype.defaultOptions = t(a.prototype.defaultOptions, f || {});
            };
            B(c, {
                initAnnotation: function (a) {
                    a = new (F.types[a.type] || F)(this, a);
                    this.annotations.push(a);
                    return a;
                },
                addAnnotation: function (a, b) {
                    a = this.initAnnotation(a);
                    this.options.annotations.push(a.options);
                    w(b, !0) && (a.redraw(), a.graphic.attr({ opacity: 1 }));
                    return a;
                },
                removeAnnotation: function (a) {
                    var b = this.annotations,
                        d =
                            "annotations" === a.coll
                                ? a
                                : E(b, function (b) {
                                      return b.options.id === a;
                                  });
                    d && (x(d, "remove"), y(this.options.annotations, d.options), y(b, d), d.destroy());
                },
                drawAnnotations: function () {
                    this.plotBoxClip.attr(this.plotBox);
                    this.annotations.forEach(function (a) {
                        a.redraw();
                        a.graphic.animate({ opacity: 1 }, a.animationConfig);
                    });
                },
            });
            c.collectionsWithUpdate.push("annotations");
            c.collectionsWithInit.annotations = [c.addAnnotation];
            C(l, "afterInit", function () {
                this.annotations = [];
                this.options.annotations || (this.options.annotations = []);
            });
            c.callbacks.push(function (a) {
                a.plotBoxClip = this.renderer.clipRect(this.plotBox);
                a.controlPointsGroup = a.renderer.g("control-points").attr({ zIndex: 99 }).clip(a.plotBoxClip).add();
                a.options.annotations.forEach(function (b, d) {
                    if (
                        !a.annotations.some(function (a) {
                            return a.options === b;
                        })
                    ) {
                        var f = a.initAnnotation(b);
                        a.options.annotations[d] = f.options;
                    }
                });
                a.drawAnnotations();
                C(a, "redraw", a.drawAnnotations);
                C(a, "destroy", function () {
                    a.plotBoxClip.destroy();
                    a.controlPointsGroup.destroy();
                });
                C(a, "exportData", function (b) {
                    var d = ((this.options.exporting && this.options.exporting.csv) || {}).columnHeaderFormatter,
                        f = !b.dataRows[1].xValues,
                        g = a.options.lang && a.options.lang.exportData && a.options.lang.exportData.annotationHeader,
                        c = function (a) {
                            if (d) {
                                var b = d(a);
                                if (!1 !== b) return b;
                            }
                            b = g + " " + a;
                            return f ? { columnTitle: b, topLevelColumnTitle: b } : b;
                        },
                        e = b.dataRows[0].length,
                        r = a.options.exporting && a.options.exporting.csv && a.options.exporting.csv.annotations && a.options.exporting.csv.annotations.itemDelimiter,
                        t = a.options.exporting && a.options.exporting.csv && a.options.exporting.csv.annotations && a.options.exporting.csv.annotations.join;
                    a.annotations.forEach(function (a) {
                        a.options.labelOptions &&
                            a.options.labelOptions.includeInDataExport &&
                            a.labels.forEach(function (a) {
                                if (a.options.text) {
                                    var d = a.options.text;
                                    a.points.forEach(function (a) {
                                        var f = a.x,
                                            g = a.series.xAxis ? a.series.xAxis.options.index : -1,
                                            c = !1;
                                        if (-1 === g) {
                                            a = b.dataRows[0].length;
                                            for (var w = Array(a), p = 0; p < a; ++p) w[p] = "";
                                            w.push(d);
                                            w.xValues = [];
                                            w.xValues[g] = f;
                                            b.dataRows.push(w);
                                            c = !0;
                                        }
                                        c ||
                                            b.dataRows.forEach(function (a) {
                                                !c && a.xValues && void 0 !== g && f === a.xValues[g] && (t && a.length > e ? (a[a.length - 1] += r + d) : a.push(d), (c = !0));
                                            });
                                        if (!c) {
                                            a = b.dataRows[0].length;
                                            w = Array(a);
                                            for (p = 0; p < a; ++p) w[p] = "";
                                            w[0] = f;
                                            w.push(d);
                                            w.xValues = [];
                                            void 0 !== g && (w.xValues[g] = f);
                                            b.dataRows.push(w);
                                        }
                                    });
                                }
                            });
                    });
                    var w = 0;
                    b.dataRows.forEach(function (a) {
                        w = Math.max(w, a.length);
                    });
                    for (var p = w - b.dataRows[0].length, z = 0; z < p; z++) {
                        var h = c(z + 1);
                        f ? (b.dataRows[0].push(h.topLevelColumnTitle), b.dataRows[1].push(h.columnTitle)) : b.dataRows[0].push(h);
                    }
                });
            });
            u(p.prototype, "onContainerMouseDown", function (a) {
                this.chart.hasDraggedAnnotation || a.apply(this, Array.prototype.slice.call(arguments, 1));
            });
            g.Annotation = F;
            ("");
            return F;
        }
    );
    v(c, "Extensions/Annotations/Types/BasicAnnotation.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h =
            (this && this.__extends) ||
            (function () {
                var c = function (e, a) {
                    c =
                        Object.setPrototypeOf ||
                        ({ __proto__: [] } instanceof Array &&
                            function (a, d) {
                                a.__proto__ = d;
                            }) ||
                        function (a, d) {
                            for (var b in d) d.hasOwnProperty(b) && (a[b] = d[b]);
                        };
                    return c(e, a);
                };
                return function (e, a) {
                    function b() {
                        this.constructor = e;
                    }
                    c(e, a);
                    e.prototype = null === a ? Object.create(a) : ((b.prototype = a.prototype), new b());
                };
            })();
        n = n.merge;
        var q = (function (m) {
            function e(a, b) {
                return m.call(this, a, b) || this;
            }
            h(e, m);
            e.prototype.addControlPoints = function () {
                var a = this.options,
                    b = e.basicControlPoints,
                    d = this.basicType;
                (a.labels || a.shapes).forEach(function (a) {
                    a.controlPoints = b[d];
                });
            };
            e.prototype.init = function () {
                var a = this.options;
                a.shapes ? (delete a.labelOptions, (this.basicType = (a = a.shapes[0].type) && "path" !== a ? a : "rectangle")) : (delete a.shapes, (this.basicType = "label"));
                c.prototype.init.apply(this, arguments);
            };
            e.basicControlPoints = {
                label: [
                    {
                        symbol: "triangle-down",
                        positioner: function (a) {
                            if (!a.graphic.placed) return { x: 0, y: -9e7 };
                            a = l.pointToPixels(a.points[0]);
                            return { x: a.x - this.graphic.width / 2, y: a.y - this.graphic.height / 2 };
                        },
                        events: {
                            drag: function (a, b) {
                                a = this.mouseMoveToTranslation(a);
                                b.translatePoint(a.x, a.y);
                                b.annotation.userOptions.labels[0].point = b.options.point;
                                b.redraw(!1);
                            },
                        },
                    },
                    {
                        symbol: "square",
                        positioner: function (a) {
                            return a.graphic.placed ? { x: a.graphic.alignAttr.x - this.graphic.width / 2, y: a.graphic.alignAttr.y - this.graphic.height / 2 } : { x: 0, y: -9e7 };
                        },
                        events: {
                            drag: function (a, b) {
                                a = this.mouseMoveToTranslation(a);
                                b.translate(a.x, a.y);
                                b.annotation.userOptions.labels[0].point = b.options.point;
                                b.redraw(!1);
                            },
                        },
                    },
                ],
                rectangle: [
                    {
                        positioner: function (a) {
                            a = l.pointToPixels(a.points[2]);
                            return { x: a.x - 4, y: a.y - 4 };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.annotation,
                                    f = this.chart.pointer.getCoordinates(a);
                                a = f.xAxis[0].value;
                                f = f.yAxis[0].value;
                                var g = b.options.points,
                                    c = d.userOptions.shapes;
                                g[1].x = a;
                                g[2].x = a;
                                g[2].y = f;
                                g[3].y = f;
                                c && c[0] && (c[0].points = b.options.points);
                                d.redraw(!1);
                            },
                        },
                    },
                ],
                circle: [
                    {
                        positioner: function (a) {
                            var b = l.pointToPixels(a.points[0]);
                            a = a.options.r;
                            return { x: b.x + a * Math.cos(Math.PI / 4) - this.graphic.width / 2, y: b.y + a * Math.sin(Math.PI / 4) - this.graphic.height / 2 };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.annotation;
                                a = this.mouseMoveToTranslation(a);
                                d = d.userOptions.shapes;
                                b.setRadius(Math.max(b.options.r + a.y / Math.sin(Math.PI / 4), 5));
                                d && d[0] && ((d[0].r = b.options.r), (d[0].point = b.options.point));
                                b.redraw(!1);
                            },
                        },
                    },
                ],
                ellipse: [
                    {
                        positioner: function (a) {
                            a = a.getAbsolutePosition(a.points[0]);
                            return { x: a.x - this.graphic.width / 2, y: a.y - this.graphic.height / 2 };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.getAbsolutePosition(b.points[0]);
                                b.translatePoint(a.chartX - d.x, a.chartY - d.y, 0);
                                b.redraw(!1);
                            },
                        },
                    },
                    {
                        positioner: function (a) {
                            a = a.getAbsolutePosition(a.points[1]);
                            return { x: a.x - this.graphic.width / 2, y: a.y - this.graphic.height / 2 };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.getAbsolutePosition(b.points[1]);
                                b.translatePoint(a.chartX - d.x, a.chartY - d.y, 1);
                                b.redraw(!1);
                            },
                        },
                    },
                    {
                        positioner: function (a) {
                            var b = a.getAbsolutePosition(a.points[0]),
                                d = a.getAbsolutePosition(a.points[1]);
                            a = a.getAttrs(b, d);
                            return { x: a.cx - this.graphic.width / 2 + a.ry * Math.sin((a.angle * Math.PI) / 180), y: a.cy - this.graphic.height / 2 - a.ry * Math.cos((a.angle * Math.PI) / 180) };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.getAbsolutePosition(b.points[0]),
                                    f = b.getAbsolutePosition(b.points[1]);
                                a = b.getDistanceFromLine(d, f, a.chartX, a.chartY);
                                d = b.getYAxis();
                                a = Math.abs(d.toValue(0) - d.toValue(a));
                                b.setYRadius(a);
                                b.redraw(!1);
                            },
                        },
                    },
                ],
            };
            return e;
        })(c);
        q.prototype.defaultOptions = n(c.prototype.defaultOptions, {});
        return (c.types.basicAnnotation = q);
    });
    v(c, "Extensions/Annotations/Types/CrookedLine.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/ControlPoint.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]], function (c, l, n, k) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var c = function (a, b) {
                        c =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                            };
                        return c(a, b);
                    };
                    return function (a, b) {
                        function d() {
                            this.constructor = a;
                        }
                        c(a, b);
                        a.prototype = null === b ? Object.create(b) : ((d.prototype = b.prototype), new d());
                    };
                })(),
            m = k.merge;
        k = (function (c) {
            function a(a, d) {
                return c.call(this, a, d) || this;
            }
            h(a, c);
            a.prototype.setClipAxes = function () {
                this.clipXAxis = this.chart.xAxis[this.options.typeOptions.xAxis];
                this.clipYAxis = this.chart.yAxis[this.options.typeOptions.yAxis];
            };
            a.prototype.getPointsOptions = function () {
                var a = this.options.typeOptions;
                return (a.points || []).map(function (b) {
                    b.xAxis = a.xAxis;
                    b.yAxis = a.yAxis;
                    return b;
                });
            };
            a.prototype.getControlPointsOptions = function () {
                return this.getPointsOptions();
            };
            a.prototype.addControlPoints = function () {
                this.getControlPointsOptions().forEach(function (a, d) {
                    d = new l(this.chart, this, m(this.options.controlPointOptions, a.controlPoint), d);
                    this.controlPoints.push(d);
                    a.controlPoint = d.options;
                }, this);
            };
            a.prototype.addShapes = function () {
                var a = this.options.typeOptions,
                    d = this.initShape(
                        m(a.line, {
                            type: "path",
                            points: this.points.map(function (a, b) {
                                return function (a) {
                                    return a.annotation.points[b];
                                };
                            }),
                        }),
                        0
                    );
                a.line = d.options;
            };
            return a;
        })(c);
        k.prototype.defaultOptions = m(c.prototype.defaultOptions, {
            typeOptions: { xAxis: 0, yAxis: 0, line: { fill: "none" } },
            controlPointOptions: {
                positioner: function (c) {
                    var a = this.graphic;
                    c = n.pointToPixels(c.points[this.index]);
                    return { x: c.x - a.width / 2, y: c.y - a.height / 2 };
                },
                events: {
                    drag: function (c, a) {
                        a.chart.isInsidePlot(c.chartX - a.chart.plotLeft, c.chartY - a.chart.plotTop, { visiblePlotOnly: !0 }) &&
                            ((c = this.mouseMoveToTranslation(c)),
                            a.translatePoint(c.x, c.y, this.index),
                            (a.options.typeOptions.points[this.index].x = a.points[this.index].x),
                            (a.options.typeOptions.points[this.index].y = a.points[this.index].y),
                            a.redraw(!1));
                    },
                },
            },
        });
        return (c.types.crookedLine = k);
    });
    v(c, "Extensions/Annotations/Types/ElliottWave.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/Types/CrookedLine.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var c = function (e, a) {
                        c =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, d) {
                                    a.__proto__ = d;
                                }) ||
                            function (a, d) {
                                for (var b in d) d.hasOwnProperty(b) && (a[b] = d[b]);
                            };
                        return c(e, a);
                    };
                    return function (e, a) {
                        function b() {
                            this.constructor = e;
                        }
                        c(e, a);
                        e.prototype = null === a ? Object.create(a) : ((b.prototype = a.prototype), new b());
                    };
                })(),
            q = n.merge;
        n = (function (c) {
            function e(a, b) {
                return c.call(this, a, b) || this;
            }
            h(e, c);
            e.prototype.addLabels = function () {
                this.getPointsOptions().forEach(function (a, b) {
                    var d = this.initLabel(
                        q(a.label, {
                            text: this.options.typeOptions.labels[b],
                            point: function (a) {
                                return a.annotation.points[b];
                            },
                        }),
                        !1
                    );
                    a.label = d.options;
                }, this);
            };
            return e;
        })(l);
        n.prototype.defaultOptions = q(l.prototype.defaultOptions, {
            typeOptions: { labels: "(0) (A) (B) (C) (D) (E)".split(" "), line: { strokeWidth: 1 } },
            labelOptions: { align: "center", allowOverlap: !0, crop: !0, overflow: "none", type: "rect", backgroundColor: "none", borderWidth: 0, y: -5 },
        });
        return (c.types.elliottWave = n);
    });
    v(
        c,
        "Extensions/Annotations/Types/Tunnel.js",
        [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/ControlPoint.js"], c["Extensions/Annotations/Types/CrookedLine.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]],
        function (c, l, n, k, q) {
            var h =
                    (this && this.__extends) ||
                    (function () {
                        var a = function (b, d) {
                            a =
                                Object.setPrototypeOf ||
                                ({ __proto__: [] } instanceof Array &&
                                    function (a, b) {
                                        a.__proto__ = b;
                                    }) ||
                                function (a, b) {
                                    for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                                };
                            return a(b, d);
                        };
                        return function (b, d) {
                            function c() {
                                this.constructor = b;
                            }
                            a(b, d);
                            b.prototype = null === d ? Object.create(d) : ((c.prototype = d.prototype), new c());
                        };
                    })(),
                e = q.merge;
            q = (function (a) {
                function b(b, c) {
                    return a.call(this, b, c) || this;
                }
                h(b, a);
                b.prototype.getPointsOptions = function () {
                    var a = n.prototype.getPointsOptions.call(this);
                    a[2] = this.heightPointOptions(a[1]);
                    a[3] = this.heightPointOptions(a[0]);
                    return a;
                };
                b.prototype.getControlPointsOptions = function () {
                    return this.getPointsOptions().slice(0, 2);
                };
                b.prototype.heightPointOptions = function (a) {
                    a = e(a);
                    a.y += this.options.typeOptions.height;
                    return a;
                };
                b.prototype.addControlPoints = function () {
                    n.prototype.addControlPoints.call(this);
                    var a = this.options,
                        b = a.typeOptions;
                    a = new l(this.chart, this, e(a.controlPointOptions, b.heightControlPoint), 2);
                    this.controlPoints.push(a);
                    b.heightControlPoint = a.options;
                };
                b.prototype.addShapes = function () {
                    this.addLine();
                    this.addBackground();
                };
                b.prototype.addLine = function () {
                    var a = this.initShape(
                        e(this.options.typeOptions.line, {
                            type: "path",
                            points: [
                                this.points[0],
                                this.points[1],
                                function (a) {
                                    a = k.pointToOptions(a.annotation.points[2]);
                                    a.command = "M";
                                    return a;
                                },
                                this.points[3],
                            ],
                        }),
                        0
                    );
                    this.options.typeOptions.line = a.options;
                };
                b.prototype.addBackground = function () {
                    var a = this.initShape(e(this.options.typeOptions.background, { type: "path", points: this.points.slice() }), 1);
                    this.options.typeOptions.background = a.options;
                };
                b.prototype.translateSide = function (a, b, c) {
                    c = Number(c);
                    var d = 0 === c ? 3 : 2;
                    this.translatePoint(a, b, c);
                    this.translatePoint(a, b, d);
                };
                b.prototype.translateHeight = function (a) {
                    this.translatePoint(0, a, 2);
                    this.translatePoint(0, a, 3);
                    this.options.typeOptions.height = this.points[3].y - this.points[0].y;
                    this.userOptions.typeOptions.height = this.options.typeOptions.height;
                };
                return b;
            })(n);
            q.prototype.defaultOptions = e(n.prototype.defaultOptions, {
                typeOptions: {
                    background: { fill: "rgba(130, 170, 255, 0.4)", strokeWidth: 0 },
                    line: { strokeWidth: 1 },
                    height: -2,
                    heightControlPoint: {
                        positioner: function (a) {
                            var b = k.pointToPixels(a.points[2]);
                            a = k.pointToPixels(a.points[3]);
                            var d = (b.x + a.x) / 2;
                            return { x: d - this.graphic.width / 2, y: ((a.y - b.y) / (a.x - b.x)) * (d - b.x) + b.y - this.graphic.height / 2 };
                        },
                        events: {
                            drag: function (a, b) {
                                b.chart.isInsidePlot(a.chartX - b.chart.plotLeft, a.chartY - b.chart.plotTop, { visiblePlotOnly: !0 }) && (b.translateHeight(this.mouseMoveToTranslation(a).y), b.redraw(!1));
                            },
                        },
                    },
                },
                controlPointOptions: {
                    events: {
                        drag: function (a, b) {
                            b.chart.isInsidePlot(a.chartX - b.chart.plotLeft, a.chartY - b.chart.plotTop, { visiblePlotOnly: !0 }) && ((a = this.mouseMoveToTranslation(a)), b.translateSide(a.x, a.y, !!this.index), b.redraw(!1));
                        },
                    },
                },
            });
            return (c.types.tunnel = q);
        }
    );
    v(c, "Extensions/Annotations/Types/InfinityLine.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/Types/CrookedLine.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]], function (
        c,
        l,
        n,
        k
    ) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var c = function (a, b) {
                        c =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                            };
                        return c(a, b);
                    };
                    return function (a, b) {
                        function d() {
                            this.constructor = a;
                        }
                        c(a, b);
                        a.prototype = null === b ? Object.create(b) : ((d.prototype = b.prototype), new d());
                    };
                })(),
            m = k.merge;
        k = (function (c) {
            function a(a, d) {
                return c.call(this, a, d) || this;
            }
            h(a, c);
            a.edgePoint = function (b, d) {
                return function (c) {
                    c = c.annotation;
                    var g = c.points,
                        f = c.options.typeOptions.type;
                    if ("horizontalLine" === f || "verticalLine" === f)
                        g = [g[0], new n(c.chart, g[0].target, { x: g[0].x + +("horizontalLine" === f), y: g[0].y + +("verticalLine" === f), xAxis: g[0].options.xAxis, yAxis: g[0].options.yAxis })];
                    return a.findEdgePoint(g[b], g[d]);
                };
            };
            a.findEdgeCoordinate = function (a, d, c, g) {
                var b = "x" === c ? "y" : "x";
                return ((d[c] - a[c]) * (g - a[b])) / (d[b] - a[b]) + a[c];
            };
            a.findEdgePoint = function (b, d) {
                var c = b.series.chart,
                    g = b.series.xAxis,
                    e = d.series.yAxis,
                    p = n.pointToPixels(b);
                d = n.pointToPixels(d);
                var h = d.x - p.x,
                    l = d.y - p.y,
                    k = g.left,
                    m = k + g.width;
                g = e.top;
                e = g + e.height;
                m = 0 > h ? k : m;
                var q = 0 > l ? g : e;
                k = { x: 0 === h ? p.x : m, y: 0 === l ? p.y : q };
                0 !== h && 0 !== l && ((h = a.findEdgeCoordinate(p, d, "y", m)), (p = a.findEdgeCoordinate(p, d, "x", q)), h >= g && h <= e ? ((k.x = m), (k.y = h)) : ((k.x = p), (k.y = q)));
                k.x -= c.plotLeft;
                k.y -= c.plotTop;
                b.series.chart.inverted && ((b = k.x), (k.x = k.y), (k.y = b));
                return k;
            };
            a.prototype.addShapes = function () {
                var b = this.options.typeOptions,
                    d = [this.points[0], a.endEdgePoint];
                b.type.match(/line/gi) && (d[0] = a.startEdgePoint);
                d = this.initShape(m(b.line, { type: "path", points: d }), 0);
                b.line = d.options;
            };
            a.endEdgePoint = a.edgePoint(0, 1);
            a.startEdgePoint = a.edgePoint(1, 0);
            return a;
        })(l);
        k.prototype.defaultOptions = m(l.prototype.defaultOptions, {});
        c.types.infinityLine = k;
        ("");
        return k;
    });
    v(c, "Extensions/Annotations/Types/TimeCycles.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/Types/CrookedLine.js"], c["Extensions/Annotations/ControlPoint.js"], c["Core/Utilities.js"]], function (
        c,
        l,
        n,
        k
    ) {
        function h(a, b, c, e) {
            for (var d = [], g = 1; g <= b; g++) d.push(["A", a / 2, a / 2, 0, 1, 1, c + g * a, e]);
            return d;
        }
        var m =
                (this && this.__extends) ||
                (function () {
                    var a = function (b, d) {
                        a =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                            };
                        return a(b, d);
                    };
                    return function (b, d) {
                        function c() {
                            this.constructor = b;
                        }
                        a(b, d);
                        b.prototype = null === d ? Object.create(d) : ((c.prototype = d.prototype), new c());
                    };
                })(),
            e = k.merge,
            a = k.isNumber,
            b = k.defined;
        k = (function (d) {
            function c() {
                return (null !== d && d.apply(this, arguments)) || this;
            }
            m(c, d);
            c.prototype.init = function (a, c, f) {
                b(c.yAxis) &&
                    c.points.forEach(function (a) {
                        a.yAxis = c.yAxis;
                    });
                b(c.xAxis) &&
                    c.points.forEach(function (a) {
                        a.xAxis = c.xAxis;
                    });
                d.prototype.init.call(this, a, c, f);
            };
            c.prototype.setPath = function () {
                this.shapes[0].options.d = this.getPath();
            };
            c.prototype.getPath = function () {
                return [["M", this.startX, this.y]].concat(h(this.pixelInterval, this.numberOfCircles, this.startX, this.y));
            };
            c.prototype.addShapes = function () {
                var a = this.options.typeOptions;
                this.setPathProperties();
                var b = this.initShape(e(a.line, { type: "path", d: this.getPath(), points: this.options.points }), 0);
                a.line = b.options;
            };
            c.prototype.addControlPoints = function () {
                var a = this,
                    b = this.options,
                    d = b.typeOptions;
                b.controlPointOptions.style.cursor = this.chart.inverted ? "ns-resize" : "ew-resize";
                d.controlPointOptions.forEach(function (d) {
                    d = e(b.controlPointOptions, d);
                    d = new n(a.chart, a, d, 0);
                    a.controlPoints.push(d);
                });
            };
            c.prototype.setPathProperties = function () {
                var b = this.options.typeOptions,
                    d = b.points;
                if (d) {
                    var c = d[0],
                        f = this.chart.xAxis[b.xAxis || 0],
                        e = this.chart.yAxis[b.yAxis || 0];
                    b = c.x;
                    var h = c.y;
                    c = d[1].x;
                    b &&
                        c &&
                        ((d = a(h) ? e.toPixels(h) : e.top + e.height),
                        (b = a(b) ? f.toPixels(b) : f.left),
                        (e = a(c) ? f.toPixels(c) : f.left + 30),
                        (e = Math.round(Math.max(Math.abs(e - b), 2))),
                        (c = Math.floor(f.len / e) + 2),
                        (this.startX = b - (Math.floor((b - f.left) / e) + 1) * e),
                        (this.y = d),
                        (this.pixelInterval = e),
                        (this.numberOfCircles = c));
                }
            };
            c.prototype.redraw = function (a) {
                this.setPathProperties();
                this.setPath();
                d.prototype.redraw.call(this, a);
            };
            return c;
        })(l);
        k.prototype.defaultOptions = e(l.prototype.defaultOptions, {
            typeOptions: {
                controlPointOptions: [
                    {
                        positioner: function (a) {
                            return { x: a.anchor(a.points[0]).absolutePosition.x - this.graphic.width / 2, y: a.y - this.graphic.height };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.anchor(b.points[0]).absolutePosition;
                                b.translatePoint(a.chartX - d.x, 0, 0);
                                b.redraw(!1);
                            },
                        },
                    },
                    {
                        positioner: function (a) {
                            return { x: a.anchor(a.points[1]).absolutePosition.x - this.graphic.width / 2, y: a.y - this.graphic.height };
                        },
                        events: {
                            drag: function (a, b) {
                                var d = b.anchor(b.points[1]).absolutePosition;
                                b.translatePoint(a.chartX - d.x, 0, 1);
                                b.redraw(!1);
                            },
                        },
                    },
                ],
            },
        });
        c.types.timeCycles = k;
        ("");
        return k;
    });
    v(c, "Extensions/Annotations/Types/Fibonacci.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/MockPoint.js"], c["Extensions/Annotations/Types/Tunnel.js"], c["Core/Utilities.js"]], function (c, l, n, k) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var a = function (b, d) {
                        a =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                            };
                        return a(b, d);
                    };
                    return function (b, d) {
                        function c() {
                            this.constructor = b;
                        }
                        a(b, d);
                        b.prototype = null === d ? Object.create(d) : ((c.prototype = d.prototype), new c());
                    };
                })(),
            m = k.merge,
            e = function (a, b) {
                return function () {
                    var d = this.annotation;
                    if (!d.startRetracements || !d.endRetracements) return [];
                    var c = this.anchor(d.startRetracements[a]).absolutePosition,
                        g = this.anchor(d.endRetracements[a]).absolutePosition;
                    c = [
                        ["M", Math.round(c.x), Math.round(c.y)],
                        ["L", Math.round(g.x), Math.round(g.y)],
                    ];
                    b &&
                        ((g = this.anchor(d.endRetracements[a - 1]).absolutePosition),
                        (d = this.anchor(d.startRetracements[a - 1]).absolutePosition),
                        c.push(["L", Math.round(g.x), Math.round(g.y)], ["L", Math.round(d.x), Math.round(d.y)]));
                    return c;
                };
            };
        k = (function (a) {
            function b(b, c) {
                return a.call(this, b, c) || this;
            }
            h(b, a);
            b.prototype.linkPoints = function () {
                a.prototype.linkPoints.call(this);
                this.linkRetracementsPoints();
            };
            b.prototype.linkRetracementsPoints = function () {
                var a = this.points,
                    c = a[0].y - a[3].y,
                    g = a[1].y - a[2].y,
                    e = a[0].x,
                    p = a[1].x;
                b.levels.forEach(function (b, d) {
                    var f = a[0].y - c * b;
                    b = a[1].y - g * b;
                    this.startRetracements = this.startRetracements || [];
                    this.endRetracements = this.endRetracements || [];
                    this.linkRetracementPoint(d, e, f, this.startRetracements);
                    this.linkRetracementPoint(d, p, b, this.endRetracements);
                }, this);
            };
            b.prototype.linkRetracementPoint = function (a, b, c, e) {
                var d = e[a],
                    f = this.options.typeOptions;
                d ? ((d.options.x = b), (d.options.y = c), d.refresh()) : (e[a] = new l(this.chart, this, { x: b, y: c, xAxis: f.xAxis, yAxis: f.yAxis }));
            };
            b.prototype.addShapes = function () {
                b.levels.forEach(function (a, b) {
                    var d = this.options.typeOptions;
                    a = d.backgroundColors;
                    var c = d.lineColor;
                    d = d.lineColors;
                    this.initShape({ type: "path", d: e(b), stroke: d[b] || c }, b);
                    0 < b && this.initShape({ type: "path", fill: a[b - 1], strokeWidth: 0, d: e(b, !0) });
                }, this);
            };
            b.prototype.addLabels = function () {
                b.levels.forEach(function (a, b) {
                    var d = this.options.typeOptions;
                    a = this.initLabel(
                        m(d.labels[b], {
                            point: function (a) {
                                return l.pointToOptions(a.annotation.startRetracements[b]);
                            },
                            text: a.toString(),
                        })
                    );
                    d.labels[b] = a.options;
                }, this);
            };
            b.levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
            return b;
        })(n);
        k.prototype.defaultOptions = m(n.prototype.defaultOptions, {
            typeOptions: {
                height: 2,
                backgroundColors: "rgba(130, 170, 255, 0.4);rgba(139, 191, 216, 0.4);rgba(150, 216, 192, 0.4);rgba(156, 229, 161, 0.4);rgba(162, 241, 130, 0.4);rgba(169, 255, 101, 0.4)".split(";"),
                lineColor: "#999999",
                lineColors: [],
                labels: [],
            },
            labelOptions: { allowOverlap: !0, align: "right", backgroundColor: "none", borderWidth: 0, crop: !1, overflow: "none", shape: "rect", style: { color: "grey" }, verticalAlign: "middle", y: 0 },
        });
        return (c.types.fibonacci = k);
    });
    v(
        c,
        "Extensions/Annotations/Types/FibonacciTimeZones.js",
        [
            c["Extensions/Annotations/Annotation.js"],
            c["Extensions/Annotations/ControlPoint.js"],
            c["Extensions/Annotations/Types/CrookedLine.js"],
            c["Extensions/Annotations/Types/InfinityLine.js"],
            c["Extensions/Annotations/MockPoint.js"],
            c["Core/Utilities.js"],
        ],
        function (c, l, n, k, q, m) {
            var e =
                    (this && this.__extends) ||
                    (function () {
                        var a = function (b, c) {
                            a =
                                Object.setPrototypeOf ||
                                ({ __proto__: [] } instanceof Array &&
                                    function (a, b) {
                                        a.__proto__ = b;
                                    }) ||
                                function (a, b) {
                                    for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                                };
                            return a(b, c);
                        };
                        return function (b, c) {
                            function d() {
                                this.constructor = b;
                            }
                            a(b, c);
                            b.prototype = null === c ? Object.create(c) : ((d.prototype = c.prototype), new d());
                        };
                    })(),
                a = m.merge;
            m = (function (b) {
                function d() {
                    return (null !== b && b.apply(this, arguments)) || this;
                }
                e(d, b);
                d.prototype.edgePoint = function (a, b, d) {
                    return function (c) {
                        var e = c.annotation.chart;
                        c = c.annotation.points;
                        var f = c[0].series.xAxis.toValue(c[0].plotX + (e.inverted ? e.plotTop : e.plotLeft) + d * (1 < c.length ? c[1].plotX - c[0].plotX : 0));
                        c = [new q(e, c[0].target, { x: f, y: 0, xAxis: c[0].options.xAxis, yAxis: c[0].options.yAxis }), new q(e, c[0].target, { x: f, y: 1, xAxis: c[0].options.xAxis, yAxis: c[0].options.yAxis })];
                        return k.findEdgePoint(c[a], c[b]);
                    };
                };
                d.prototype.addShapes = function () {
                    for (var b = 1, d = 1, c = 0; 11 > c; c++) {
                        var e = c ? b : 0;
                        e = [this.edgePoint(1, 0, e), this.edgePoint(0, 1, e)];
                        d = b + d;
                        b = d - b;
                        1 === c && (this.secondLineEdgePoints = [e[0], e[1]]);
                        this.initShape(a(this.options.typeOptions.line, { type: "path", points: e }), c);
                    }
                };
                d.prototype.addControlPoints = function () {
                    var b = this.options,
                        d = b.typeOptions;
                    b = new l(this.chart, this, a(b.controlPointOptions, d.controlPointOptions), 0);
                    this.controlPoints.push(b);
                    d.controlPointOptions = b.options;
                };
                return d;
            })(n);
            m.prototype.defaultOptions = a(n.prototype.defaultOptions, {
                typeOptions: {
                    line: { stroke: "rgba(0, 0, 0, 0.75)", strokeWidth: 1, fill: void 0 },
                    controlPointOptions: {
                        positioner: function () {
                            var a = this.target,
                                d = this.graphic,
                                c = a.secondLineEdgePoints,
                                e = { annotation: a };
                            var r = c[0](e).y;
                            var h = c[1](e).y;
                            a = this.chart.plotLeft;
                            var u = this.chart.plotTop;
                            c = c[0](e).x;
                            r = (r + h) / 2;
                            this.chart.inverted && ((r = [r, c]), (c = r[0]), (r = r[1]));
                            return { x: a + c - d.width / 2, y: u + r - d.height / 2 };
                        },
                        events: {
                            drag: function (a, d) {
                                d.chart.isInsidePlot(a.chartX - d.chart.plotLeft, a.chartY - d.chart.plotTop, { visiblePlotOnly: !0 }) && ((a = this.mouseMoveToTranslation(a)), d.translatePoint(a.x, 0, 1), d.redraw(!1));
                            },
                        },
                    },
                },
            });
            c.types.fibonacciTimeZones = m;
            ("");
            return m;
        }
    );
    v(c, "Extensions/Annotations/Types/Pitchfork.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/Types/InfinityLine.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]], function (c, l, n, k) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var c = function (a, b) {
                        c =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d]);
                            };
                        return c(a, b);
                    };
                    return function (a, b) {
                        function d() {
                            this.constructor = a;
                        }
                        c(a, b);
                        a.prototype = null === b ? Object.create(b) : ((d.prototype = b.prototype), new d());
                    };
                })(),
            m = k.merge;
        k = (function (c) {
            function a(a, d) {
                return c.call(this, a, d) || this;
            }
            h(a, c);
            a.outerLineEdgePoint = function (b) {
                return function (d) {
                    var c = d.annotation,
                        e = c.points;
                    return a.findEdgePoint(e[b], e[0], new n(c.chart, d, c.midPointOptions()));
                };
            };
            a.findEdgePoint = function (a, d, c) {
                d = Math.atan2(c.plotY - d.plotY, c.plotX - d.plotX);
                return { x: a.plotX + 1e7 * Math.cos(d), y: a.plotY + 1e7 * Math.sin(d) };
            };
            a.middleLineEdgePoint = function (a) {
                var b = a.annotation;
                return l.findEdgePoint(b.points[0], new n(b.chart, a, b.midPointOptions()));
            };
            a.prototype.midPointOptions = function () {
                var a = this.points;
                return { x: (a[1].x + a[2].x) / 2, y: (a[1].y + a[2].y) / 2, xAxis: a[0].series.xAxis, yAxis: a[0].series.yAxis };
            };
            a.prototype.addShapes = function () {
                this.addLines();
                this.addBackgrounds();
            };
            a.prototype.addLines = function () {
                this.initShape({ type: "path", points: [this.points[0], a.middleLineEdgePoint] }, 0);
                this.initShape({ type: "path", points: [this.points[1], a.topLineEdgePoint] }, 1);
                this.initShape({ type: "path", points: [this.points[2], a.bottomLineEdgePoint] }, 2);
            };
            a.prototype.addBackgrounds = function () {
                var a = this.shapes,
                    d = this.options.typeOptions,
                    c = this.initShape(
                        m(d.innerBackground, {
                            type: "path",
                            points: [
                                function (a) {
                                    var b = a.annotation;
                                    a = b.points;
                                    b = b.midPointOptions();
                                    return { x: (a[1].x + b.x) / 2, y: (a[1].y + b.y) / 2, xAxis: b.xAxis, yAxis: b.yAxis };
                                },
                                a[1].points[1],
                                a[2].points[1],
                                function (a) {
                                    var b = a.annotation;
                                    a = b.points;
                                    b = b.midPointOptions();
                                    return { x: (b.x + a[2].x) / 2, y: (b.y + a[2].y) / 2, xAxis: b.xAxis, yAxis: b.yAxis };
                                },
                            ],
                        }),
                        3
                    );
                a = this.initShape(m(d.outerBackground, { type: "path", points: [this.points[1], a[1].points[1], a[2].points[1], this.points[2]] }), 4);
                d.innerBackground = c.options;
                d.outerBackground = a.options;
            };
            a.topLineEdgePoint = a.outerLineEdgePoint(1);
            a.bottomLineEdgePoint = a.outerLineEdgePoint(0);
            return a;
        })(l);
        k.prototype.defaultOptions = m(l.prototype.defaultOptions, { typeOptions: { innerBackground: { fill: "rgba(130, 170, 255, 0.4)", strokeWidth: 0 }, outerBackground: { fill: "rgba(156, 229, 161, 0.4)", strokeWidth: 0 } } });
        return (c.types.pitchfork = k);
    });
    v(c, "Extensions/Annotations/Types/VerticalLine.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/MockPoint.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var c = function (a, b) {
                        c =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                            };
                        return c(a, b);
                    };
                    return function (a, b) {
                        function d() {
                            this.constructor = a;
                        }
                        c(a, b);
                        a.prototype = null === b ? Object.create(b) : ((d.prototype = b.prototype), new d());
                    };
                })(),
            q = n.merge,
            m = n.pick;
        n = (function (c) {
            function a(a, d) {
                return c.call(this, a, d) || this;
            }
            h(a, c);
            a.connectorFirstPoint = function (a) {
                var b = a.annotation;
                a = b.chart;
                var c = a.inverted,
                    e = b.points[0],
                    h = m(e.series.yAxis && e.series.yAxis.left, 0),
                    p = m(e.series.yAxis && e.series.yAxis.top, 0);
                b = b.options.typeOptions.label.offset;
                var u = l.pointToPixels(e, !0)[c ? "x" : "y"];
                return { x: e.x, xAxis: e.series.xAxis, y: u + b + (c ? h - a.plotLeft : p - a.plotTop) };
            };
            a.connectorSecondPoint = function (a) {
                var b = a.annotation;
                a = b.chart;
                var c = a.inverted,
                    e = b.options.typeOptions;
                b = b.points[0];
                var h = m(b.series.yAxis && b.series.yAxis.left, 0),
                    p = m(b.series.yAxis && b.series.yAxis.top, 0),
                    u = e.yOffset,
                    k = l.pointToPixels(b, !0)[c ? "x" : "y"];
                0 > e.label.offset && (u *= -1);
                return { x: b.x, xAxis: b.series.xAxis, y: k + u + (c ? h - a.plotLeft : p - a.plotTop) };
            };
            a.prototype.getPointsOptions = function () {
                return [this.options.typeOptions.point];
            };
            a.prototype.addShapes = function () {
                var b = this.options.typeOptions,
                    c = this.initShape(q(b.connector, { type: "path", points: [a.connectorFirstPoint, a.connectorSecondPoint] }), 0);
                b.connector = c.options;
            };
            a.prototype.addLabels = function () {
                var a = this.options.typeOptions,
                    c = a.label,
                    e = 0,
                    g = c.offset,
                    h = 0 > c.offset ? "bottom" : "top",
                    p = "center";
                this.chart.inverted && ((e = c.offset), (g = 0), (h = "middle"), (p = 0 > c.offset ? "right" : "left"));
                c = this.initLabel(q(c, { verticalAlign: h, align: p, x: e, y: g }));
                a.label = c.options;
            };
            return a;
        })(c);
        n.prototype.defaultOptions = q(c.prototype.defaultOptions, {
            typeOptions: {
                yOffset: 10,
                label: {
                    offset: -40,
                    point: function (c) {
                        return c.annotation.points[0];
                    },
                    allowOverlap: !0,
                    backgroundColor: "none",
                    borderWidth: 0,
                    crop: !0,
                    overflow: "none",
                    shape: "rect",
                    text: "{y:.2f}",
                },
                connector: { strokeWidth: 1, markerEnd: "arrow" },
            },
        });
        return (c.types.verticalLine = n);
    });
    v(c, "Extensions/Annotations/Types/Measure.js", [c["Extensions/Annotations/Annotation.js"], c["Extensions/Annotations/ControlPoint.js"], c["Core/Utilities.js"]], function (c, l, n) {
        var h =
                (this && this.__extends) ||
                (function () {
                    var a = function (b, c) {
                        a =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (a, b) {
                                    a.__proto__ = b;
                                }) ||
                            function (a, b) {
                                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                            };
                        return a(b, c);
                    };
                    return function (b, c) {
                        function d() {
                            this.constructor = b;
                        }
                        a(b, c);
                        b.prototype = null === c ? Object.create(c) : ((d.prototype = c.prototype), new d());
                    };
                })(),
            q = n.defined,
            m = n.extend,
            e = n.isNumber,
            a = n.merge,
            b = n.pick,
            d = (function (d) {
                function g(a, b) {
                    return d.call(this, a, b) || this;
                }
                h(g, d);
                g.prototype.init = function (a, b, d) {
                    c.prototype.init.call(this, a, b, d);
                    this.resizeY = this.resizeX = this.offsetY = this.offsetX = 0;
                    g.calculations.init.call(this);
                    this.addValues();
                    this.addShapes();
                };
                g.prototype.setClipAxes = function () {
                    this.clipXAxis = this.chart.xAxis[this.options.typeOptions.xAxis];
                    this.clipYAxis = this.chart.yAxis[this.options.typeOptions.yAxis];
                };
                g.prototype.pointsOptions = function () {
                    return this.options.points;
                };
                g.prototype.shapePointsOptions = function () {
                    var a = this.options.typeOptions,
                        b = a.xAxis;
                    a = a.yAxis;
                    return [
                        { x: this.xAxisMin, y: this.yAxisMin, xAxis: b, yAxis: a },
                        { x: this.xAxisMax, y: this.yAxisMin, xAxis: b, yAxis: a },
                        { x: this.xAxisMax, y: this.yAxisMax, xAxis: b, yAxis: a },
                        { x: this.xAxisMin, y: this.yAxisMax, xAxis: b, yAxis: a },
                    ];
                };
                g.prototype.addControlPoints = function () {
                    var a = this.chart.inverted,
                        b = this.options.controlPointOptions,
                        c = this.options.typeOptions.selectType;
                    q(this.userOptions.controlPointOptions && this.userOptions.controlPointOptions.style.cursor) ||
                        ("x" === c ? (b.style.cursor = a ? "ns-resize" : "ew-resize") : "y" === c && (b.style.cursor = a ? "ew-resize" : "ns-resize"));
                    a = new l(this.chart, this, this.options.controlPointOptions, 0);
                    this.controlPoints.push(a);
                    "xy" !== c && ((a = new l(this.chart, this, this.options.controlPointOptions, 1)), this.controlPoints.push(a));
                };
                g.prototype.addValues = function (a) {
                    var c = this.options.typeOptions,
                        d = c.label.formatter;
                    g.calculations.recalculate.call(this, a);
                    c.label.enabled &&
                        (0 < this.labels.length
                            ? (this.labels[0].text = (d && d.call(this)) || g.calculations.defaultFormatter.call(this))
                            : this.initLabel(
                                  m(
                                      {
                                          shape: "rect",
                                          backgroundColor: "none",
                                          color: "black",
                                          borderWidth: 0,
                                          dashStyle: "Dash",
                                          overflow: "allow",
                                          align: "left",
                                          y: 0,
                                          x: 0,
                                          verticalAlign: "top",
                                          crop: !0,
                                          xAxis: 0,
                                          yAxis: 0,
                                          point: function (a) {
                                              var d = a.annotation;
                                              a = a.options;
                                              return { x: d.xAxisMin, y: d.yAxisMin, xAxis: b(c.xAxis, a.xAxis), yAxis: b(c.yAxis, a.yAxis) };
                                          },
                                          text: (d && d.call(this)) || g.calculations.defaultFormatter.call(this),
                                      },
                                      c.label
                                  ),
                                  void 0
                              ));
                };
                g.prototype.addShapes = function () {
                    this.addCrosshairs();
                    this.addBackground();
                };
                g.prototype.addBackground = function () {
                    "undefined" !== typeof this.shapePointsOptions()[0].x && this.initShape(m({ type: "path", points: this.shapePointsOptions() }, this.options.typeOptions.background), 2);
                };
                g.prototype.addCrosshairs = function () {
                    var b = this.chart,
                        c = this.options.typeOptions,
                        d = this.options.typeOptions.point,
                        e = b.xAxis[c.xAxis],
                        g = b.yAxis[c.yAxis],
                        f = b.inverted;
                    b = e.toPixels(this.xAxisMin);
                    e = e.toPixels(this.xAxisMax);
                    var h = g.toPixels(this.yAxisMin),
                        k = g.toPixels(this.yAxisMax),
                        l = { point: d, type: "path" };
                    d = [];
                    g = [];
                    f && ((f = b), (b = h), (h = f), (f = e), (e = k), (k = f));
                    c.crosshairX.enabled &&
                        (d = [
                            ["M", b, h + (k - h) / 2],
                            ["L", e, h + (k - h) / 2],
                        ]);
                    c.crosshairY.enabled &&
                        (g = [
                            ["M", b + (e - b) / 2, h],
                            ["L", b + (e - b) / 2, k],
                        ]);
                    0 < this.shapes.length ? ((this.shapes[0].options.d = d), (this.shapes[1].options.d = g)) : ((b = a(l, c.crosshairX)), (c = a(l, c.crosshairY)), this.initShape(m({ d: d }, b), 0), this.initShape(m({ d: g }, c), 1));
                };
                g.prototype.onDrag = function (a) {
                    var b = this.mouseMoveToTranslation(a),
                        c = this.options.typeOptions.selectType;
                    a = "y" === c ? 0 : b.x;
                    b = "x" === c ? 0 : b.y;
                    this.translate(a, b);
                    this.offsetX += a;
                    this.offsetY += b;
                    this.redraw(!1, !1, !0);
                };
                g.prototype.resize = function (a, b, c, d) {
                    var e = this.shapes[2];
                    "x" === d
                        ? 0 === c
                            ? (e.translatePoint(a, 0, 0), e.translatePoint(a, b, 3))
                            : (e.translatePoint(a, 0, 1), e.translatePoint(a, b, 2))
                        : "y" === d
                        ? 0 === c
                            ? (e.translatePoint(0, b, 0), e.translatePoint(0, b, 1))
                            : (e.translatePoint(0, b, 2), e.translatePoint(0, b, 3))
                        : (e.translatePoint(a, 0, 1), e.translatePoint(a, b, 2), e.translatePoint(0, b, 3));
                    g.calculations.updateStartPoints.call(this, !1, !0, c, a, b);
                    this.options.typeOptions.background.height = Math.abs(this.startYMax - this.startYMin);
                    this.options.typeOptions.background.width = Math.abs(this.startXMax - this.startXMin);
                };
                g.prototype.redraw = function (a, b, c) {
                    this.linkPoints();
                    this.graphic || this.render();
                    c && g.calculations.updateStartPoints.call(this, !0, !1);
                    this.clipRect && this.clipRect.animate(this.getClipBox());
                    this.addValues(b);
                    this.addCrosshairs();
                    this.redrawItems(this.shapes, a);
                    this.redrawItems(this.labels, a);
                    this.controlPoints.forEach(function (a) {
                        a.redraw();
                    });
                };
                g.prototype.translate = function (a, b) {
                    this.shapes.forEach(function (c) {
                        c.translate(a, b);
                    });
                    this.options.typeOptions.point.x = this.startXMin;
                    this.options.typeOptions.point.y = this.startYMin;
                };
                g.calculations = {
                    init: function () {
                        var a = this.options.typeOptions,
                            b = this.chart,
                            c = g.calculations.getPointPos,
                            d = b.inverted,
                            f = b.xAxis[a.xAxis];
                        b = b.yAxis[a.yAxis];
                        var h = a.background,
                            k = d ? h.height : h.width;
                        h = d ? h.width : h.height;
                        var l = a.selectType,
                            m = d ? f.left : b.top;
                        d = d ? b.top : f.left;
                        this.startXMin = a.point.x;
                        this.startYMin = a.point.y;
                        e(k) ? (this.startXMax = this.startXMin + k) : (this.startXMax = c(f, this.startXMin, parseFloat(k)));
                        e(h) ? (this.startYMax = this.startYMin - h) : (this.startYMax = c(b, this.startYMin, parseFloat(h)));
                        "x" === l ? ((this.startYMin = b.toValue(m)), (this.startYMax = b.toValue(m + b.len))) : "y" === l && ((this.startXMin = f.toValue(d)), (this.startXMax = f.toValue(d + f.len)));
                    },
                    recalculate: function (a) {
                        var b = g.calculations,
                            c = this.options.typeOptions,
                            d = this.chart.xAxis[c.xAxis];
                        c = this.chart.yAxis[c.yAxis];
                        var e = g.calculations.getPointPos,
                            f = this.offsetX,
                            h = this.offsetY;
                        this.xAxisMin = e(d, this.startXMin, f);
                        this.xAxisMax = e(d, this.startXMax, f);
                        this.yAxisMin = e(c, this.startYMin, h);
                        this.yAxisMax = e(c, this.startYMax, h);
                        this.min = b.min.call(this);
                        this.max = b.max.call(this);
                        this.average = b.average.call(this);
                        this.bins = b.bins.call(this);
                        a && this.resize(0, 0);
                    },
                    getPointPos: function (a, b, c) {
                        return a.toValue(a.toPixels(b) + c);
                    },
                    updateStartPoints: function (a, b, c, d, e) {
                        var f = this.options.typeOptions,
                            h = f.selectType,
                            k = this.chart.xAxis[f.xAxis];
                        f = this.chart.yAxis[f.yAxis];
                        var l = g.calculations.getPointPos,
                            E = this.startXMin,
                            x = this.startXMax,
                            t = this.startYMin,
                            w = this.startYMax,
                            z = this.offsetX,
                            F = this.offsetY;
                        b &&
                            ("x" === h
                                ? 0 === c
                                    ? (this.startXMin = l(k, E, d))
                                    : (this.startXMax = l(k, x, d))
                                : "y" === h
                                ? 0 === c
                                    ? (this.startYMin = l(f, t, e))
                                    : (this.startYMax = l(f, w, e))
                                : ((this.startXMax = l(k, x, d)), (this.startYMax = l(f, w, e))));
                        a && ((this.startXMin = l(k, E, z)), (this.startXMax = l(k, x, z)), (this.startYMin = l(f, t, F)), (this.startYMax = l(f, w, F)), (this.offsetY = this.offsetX = 0));
                    },
                    defaultFormatter: function () {
                        return "Min: " + this.min + "<br>Max: " + this.max + "<br>Average: " + this.average + "<br>Bins: " + this.bins;
                    },
                    getExtremes: function (a, b, c, d) {
                        return { xAxisMin: Math.min(b, a), xAxisMax: Math.max(b, a), yAxisMin: Math.min(d, c), yAxisMax: Math.max(d, c) };
                    },
                    min: function () {
                        var a = Infinity,
                            b = this.chart.series,
                            c = g.calculations.getExtremes(this.xAxisMin, this.xAxisMax, this.yAxisMin, this.yAxisMax),
                            d = !1;
                        b.forEach(function (b) {
                            b.visible &&
                                "highcharts-navigator-series" !== b.options.id &&
                                b.points.forEach(function (b) {
                                    !b.isNull && b.y < a && b.x > c.xAxisMin && b.x <= c.xAxisMax && b.y > c.yAxisMin && b.y <= c.yAxisMax && ((a = b.y), (d = !0));
                                });
                        });
                        d || (a = "");
                        return a;
                    },
                    max: function () {
                        var a = -Infinity,
                            b = this.chart.series,
                            c = g.calculations.getExtremes(this.xAxisMin, this.xAxisMax, this.yAxisMin, this.yAxisMax),
                            d = !1;
                        b.forEach(function (b) {
                            b.visible &&
                                "highcharts-navigator-series" !== b.options.id &&
                                b.points.forEach(function (b) {
                                    !b.isNull && b.y > a && b.x > c.xAxisMin && b.x <= c.xAxisMax && b.y > c.yAxisMin && b.y <= c.yAxisMax && ((a = b.y), (d = !0));
                                });
                        });
                        d || (a = "");
                        return a;
                    },
                    average: function () {
                        var a = "";
                        "" !== this.max && "" !== this.min && (a = (this.max + this.min) / 2);
                        return a;
                    },
                    bins: function () {
                        var a = 0,
                            b = this.chart.series,
                            c = g.calculations.getExtremes(this.xAxisMin, this.xAxisMax, this.yAxisMin, this.yAxisMax),
                            d = !1;
                        b.forEach(function (b) {
                            b.visible &&
                                "highcharts-navigator-series" !== b.options.id &&
                                b.points.forEach(function (b) {
                                    !b.isNull && b.x > c.xAxisMin && b.x <= c.xAxisMax && b.y > c.yAxisMin && b.y <= c.yAxisMax && (a++, (d = !0));
                                });
                        });
                        d || (a = "");
                        return a;
                    },
                };
                return g;
            })(c);
        d.prototype.defaultOptions = a(c.prototype.defaultOptions, {
            typeOptions: {
                selectType: "xy",
                xAxis: 0,
                yAxis: 0,
                background: { fill: "rgba(130, 170, 255, 0.4)", strokeWidth: 0, stroke: void 0 },
                crosshairX: { enabled: !0, zIndex: 6, dashStyle: "Dash", markerEnd: "arrow" },
                crosshairY: { enabled: !0, zIndex: 6, dashStyle: "Dash", markerEnd: "arrow" },
                label: { enabled: !0, style: { fontSize: "11px", color: "#666666" }, formatter: void 0 },
            },
            controlPointOptions: {
                positioner: function (a) {
                    var b = this.index,
                        c = a.chart,
                        e = a.options,
                        f = e.typeOptions,
                        h = f.selectType;
                    e = e.controlPointOptions;
                    var l = c.inverted,
                        k = c.xAxis[f.xAxis];
                    c = c.yAxis[f.yAxis];
                    f = a.xAxisMax;
                    var m = a.yAxisMax,
                        n = d.calculations.getExtremes(a.xAxisMin, a.xAxisMax, a.yAxisMin, a.yAxisMax);
                    "x" === h && ((m = (n.yAxisMax - n.yAxisMin) / 2), 0 === b && (f = a.xAxisMin));
                    "y" === h && ((f = n.xAxisMin + (n.xAxisMax - n.xAxisMin) / 2), 0 === b && (m = a.yAxisMin));
                    l ? ((a = c.toPixels(m)), (b = k.toPixels(f))) : ((a = k.toPixels(f)), (b = c.toPixels(m)));
                    return { x: a - e.width / 2, y: b - e.height / 2 };
                },
                events: {
                    drag: function (a, b) {
                        var c = this.mouseMoveToTranslation(a);
                        a = b.options.typeOptions.selectType;
                        var d = "y" === a ? 0 : c.x;
                        c = "x" === a ? 0 : c.y;
                        b.resize(d, c, this.index, a);
                        b.resizeX += d;
                        b.resizeY += c;
                        b.redraw(!1, !0);
                    },
                },
            },
        });
        return (c.types.measure = d);
    });
    v(c, "Core/Chart/ChartNavigationComposition.js", [], function () {
        var c;
        (function (c) {
            c.compose = function (c) {
                c.navigation || (c.navigation = new h(c));
                return c;
            };
            var h = (function () {
                function c(c) {
                    this.updates = [];
                    this.chart = c;
                }
                c.prototype.addUpdate = function (c) {
                    this.chart.navigation.updates.push(c);
                };
                c.prototype.update = function (c, h) {
                    var e = this;
                    this.updates.forEach(function (a) {
                        a.call(e.chart, c, h);
                    });
                };
                return c;
            })();
            c.Additions = h;
        })(c || (c = {}));
        return c;
    });
    v(
        c,
        "Extensions/Annotations/NavigationBindings.js",
        [c["Extensions/Annotations/Annotation.js"], c["Core/Chart/Chart.js"], c["Core/Chart/ChartNavigationComposition.js"], c["Core/FormatUtilities.js"], c["Core/Globals.js"], c["Core/DefaultOptions.js"], c["Core/Utilities.js"]],
        function (c, l, n, k, q, m, e) {
            function a(a, b) {
                var c = E.Element.prototype,
                    d = c.matches || c.msMatchesSelector || c.webkitMatchesSelector,
                    e = null;
                if (c.closest) e = c.closest.call(a, b);
                else {
                    do {
                        if (d.call(a, b)) return a;
                        a = a.parentElement || a.parentNode;
                    } while (null !== a && 1 === a.nodeType);
                }
                return e;
            }
            function b(a) {
                var b = a.prototype.defaultOptions.events && a.prototype.defaultOptions.events.click;
                D(!0, a.prototype.defaultOptions.events, {
                    click: function (a) {
                        var c = this,
                            d = c.chart.navigationBindings,
                            e = d.activeAnnotation;
                        b && b.call(c, a);
                        e !== c
                            ? (d.deselectAnnotation(),
                              (d.activeAnnotation = c),
                              c.setControlPointsVisibility(!0),
                              h(d, "showPopup", {
                                  annotation: c,
                                  formType: "annotation-toolbar",
                                  options: d.annotationToFields(c),
                                  onSubmit: function (a) {
                                      var b = {};
                                      "remove" === a.actionType
                                          ? ((d.activeAnnotation = !1), d.chart.removeAnnotation(c))
                                          : (d.fieldsToOptions(a.fields, b),
                                            d.deselectAnnotation(),
                                            (a = b.typeOptions),
                                            "measure" === c.options.type && ((a.crosshairY.enabled = 0 !== a.crosshairY.strokeWidth), (a.crosshairX.enabled = 0 !== a.crosshairX.strokeWidth)),
                                            c.update(b));
                                  },
                              }))
                            : h(d, "closePopup");
                        a.activeAnnotation = !0;
                    },
                    touchstart: function (a) {
                        var c = this,
                            d = c.chart.navigationBindings,
                            e = d.activeAnnotation;
                        b && b.call(c, a);
                        e !== c
                            ? (d.deselectAnnotation(),
                              (d.activeAnnotation = c),
                              c.setControlPointsVisibility(!0),
                              h(d, "showPopup", {
                                  annotation: c,
                                  formType: "annotation-toolbar",
                                  options: d.annotationToFields(c),
                                  onSubmit: function (a) {
                                      var b = {};
                                      "remove" === a.actionType
                                          ? ((d.activeAnnotation = !1), d.chart.removeAnnotation(c))
                                          : (d.fieldsToOptions(a.fields, b),
                                            d.deselectAnnotation(),
                                            (a = b.typeOptions),
                                            "measure" === c.options.type && ((a.crosshairY.enabled = 0 !== a.crosshairY.strokeWidth), (a.crosshairX.enabled = 0 !== a.crosshairX.strokeWidth)),
                                            c.update(b));
                                  },
                              }))
                            : h(d, "closePopup");
                        a.activeAnnotation = !0;
                    },
                });
            }
            var d = k.format;
            k = m.setOptions;
            var f = e.addEvent,
                g = e.attr,
                h = e.fireEvent,
                p = e.isArray,
                u = e.isFunction,
                v = e.isNumber,
                C = e.isObject,
                D = e.merge,
                A = e.objectEach,
                y = e.pick,
                B = q.doc,
                E = q.win,
                x = (function () {
                    function b(a, b) {
                        this.selectedButton = this.boundClassNames = void 0;
                        this.chart = a;
                        this.options = b;
                        this.eventsToUnbind = [];
                        this.container = B.getElementsByClassName(this.options.bindingsClassName || "");
                    }
                    b.prototype.initEvents = function () {
                        var a = this,
                            b = a.chart,
                            c = a.container,
                            d = a.options;
                        a.boundClassNames = {};
                        A(d.bindings || {}, function (b) {
                            a.boundClassNames[b.className] = b;
                        });
                        [].forEach.call(c, function (b) {
                            a.eventsToUnbind.push(
                                f(b, "click", function (c) {
                                    var d = a.getButtonEvents(b, c);
                                    d && -1 === d.button.className.indexOf("highcharts-disabled-btn") && a.bindingsButtonClick(d.button, d.events, c);
                                })
                            );
                        });
                        A(d.events || {}, function (b, c) {
                            u(b) && a.eventsToUnbind.push(f(a, c, b, { passive: !1 }));
                        });
                        a.eventsToUnbind.push(
                            f(b.container, "click", function (c) {
                                !b.cancelClick && b.isInsidePlot(c.chartX - b.plotLeft, c.chartY - b.plotTop, { visiblePlotOnly: !0 }) && a.bindingsChartClick(this, c);
                            })
                        );
                        a.eventsToUnbind.push(
                            f(
                                b.container,
                                q.isTouchDevice ? "touchmove" : "mousemove",
                                function (b) {
                                    a.bindingsContainerMouseMove(this, b);
                                },
                                q.isTouchDevice ? { passive: !1 } : void 0
                            )
                        );
                    };
                    b.prototype.initUpdate = function () {
                        var a = this;
                        n.compose(this.chart).navigation.addUpdate(function (b) {
                            a.update(b);
                        });
                    };
                    b.prototype.bindingsButtonClick = function (a, b, c) {
                        var d = this.chart,
                            e = d.renderer.boxWrapper,
                            f = !0;
                        this.selectedButtonElement &&
                            (this.selectedButtonElement.classList === a.classList && (f = !1),
                            h(this, "deselectButton", { button: this.selectedButtonElement }),
                            this.nextEvent && (this.currentUserDetails && "annotations" === this.currentUserDetails.coll && d.removeAnnotation(this.currentUserDetails), (this.mouseMoveEvent = this.nextEvent = !1)));
                        f
                            ? ((this.selectedButton = b),
                              (this.selectedButtonElement = a),
                              h(this, "selectButton", { button: a }),
                              b.init && b.init.call(this, a, c),
                              (b.start || b.steps) && d.renderer.boxWrapper.addClass("highcharts-draw-mode"))
                            : (d.stockTools && d.stockTools.toggleButtonAciveClass(a), e.removeClass("highcharts-draw-mode"), (this.mouseMoveEvent = this.nextEvent = !1), (this.selectedButton = null));
                    };
                    b.prototype.bindingsChartClick = function (b, c) {
                        b = this.chart;
                        var d = this.activeAnnotation,
                            e = this.selectedButton;
                        b = b.renderer.boxWrapper;
                        d &&
                            (d.cancelClick || c.activeAnnotation || !c.target.parentNode || a(c.target, ".highcharts-popup")
                                ? d.cancelClick &&
                                  setTimeout(function () {
                                      d.cancelClick = !1;
                                  }, 0)
                                : h(this, "closePopup"));
                        e &&
                            e.start &&
                            (this.nextEvent
                                ? (this.nextEvent(c, this.currentUserDetails),
                                  this.steps &&
                                      (this.stepIndex++,
                                      e.steps[this.stepIndex]
                                          ? (this.mouseMoveEvent = this.nextEvent = e.steps[this.stepIndex])
                                          : (h(this, "deselectButton", { button: this.selectedButtonElement }),
                                            b.removeClass("highcharts-draw-mode"),
                                            e.end && e.end.call(this, c, this.currentUserDetails),
                                            (this.mouseMoveEvent = this.nextEvent = !1),
                                            (this.selectedButton = null))))
                                : (this.currentUserDetails = e.start.call(this, c)) && e.steps
                                ? ((this.stepIndex = 0), (this.steps = !0), (this.mouseMoveEvent = this.nextEvent = e.steps[this.stepIndex]))
                                : (h(this, "deselectButton", { button: this.selectedButtonElement }),
                                  b.removeClass("highcharts-draw-mode"),
                                  (this.steps = !1),
                                  (this.selectedButton = null),
                                  e.end && e.end.call(this, c, this.currentUserDetails)));
                    };
                    b.prototype.bindingsContainerMouseMove = function (a, b) {
                        this.mouseMoveEvent && this.mouseMoveEvent(b, this.currentUserDetails);
                    };
                    b.prototype.fieldsToOptions = function (a, b) {
                        A(a, function (a, c) {
                            var d = parseFloat(a),
                                e = c.split("."),
                                f = b,
                                g = e.length - 1;
                            !v(d) || a.match(/px/g) || c.match(/format/g) || (a = d);
                            "" !== a &&
                                "undefined" !== a &&
                                e.forEach(function (b, c) {
                                    var d = y(e[c + 1], "");
                                    g === c ? (f[b] = a) : (f[b] || (f[b] = d.match(/\d/g) ? [] : {}), (f = f[b]));
                                });
                        });
                        return b;
                    };
                    b.prototype.deselectAnnotation = function () {
                        this.activeAnnotation && (this.activeAnnotation.setControlPointsVisibility(!1), (this.activeAnnotation = !1));
                    };
                    b.prototype.annotationToFields = function (a) {
                        function c(b, e, f, t) {
                            if (f && b && -1 === w.indexOf(e) && (0 <= (f.indexOf && f.indexOf(e)) || f[e] || !0 === f))
                                if (p(b))
                                    (t[e] = []),
                                        b.forEach(function (a, b) {
                                            C(a)
                                                ? ((t[e][b] = {}),
                                                  A(a, function (a, d) {
                                                      c(a, d, g[e], t[e][b]);
                                                  }))
                                                : c(a, 0, g[e], t[e]);
                                        });
                                else if (C(b)) {
                                    var z = {};
                                    p(t) ? (t.push(z), (z[e] = {}), (z = z[e])) : (t[e] = z);
                                    A(b, function (a, b) {
                                        c(a, b, 0 === e ? f : g[e], z);
                                    });
                                } else "format" === e ? (t[e] = [d(b, a.labels[0].points[0]).toString(), "text"]) : p(t) ? t.push([b, h(b)]) : (t[e] = [b, h(b)]);
                        }
                        var e = a.options,
                            f = b.annotationsEditable,
                            g = f.nestedOptions,
                            h = this.utils.getFieldType,
                            t = y(e.type, e.shapes && e.shapes[0] && e.shapes[0].type, e.labels && e.labels[0] && e.labels[0].itemType, "label"),
                            w = b.annotationsNonEditable[e.langKey] || [],
                            x = { langKey: e.langKey, type: t };
                        A(e, function (a, b) {
                            "typeOptions" === b
                                ? ((x[b] = {}),
                                  A(e[b], function (a, d) {
                                      c(a, d, g, x[b], !0);
                                  }))
                                : c(a, b, f[t], x);
                        });
                        return x;
                    };
                    b.prototype.getClickedClassNames = function (a, b) {
                        var c = b.target;
                        b = [];
                        for (
                            var d;
                            c &&
                            ((d = g(c, "class")) &&
                                (b = b.concat(
                                    d.split(" ").map(function (a) {
                                        return [a, c];
                                    })
                                )),
                            (c = c.parentNode),
                            c !== a);

                        );
                        return b;
                    };
                    b.prototype.getButtonEvents = function (a, b) {
                        var c = this,
                            d;
                        this.getClickedClassNames(a, b).forEach(function (a) {
                            c.boundClassNames[a[0]] && !d && (d = { events: c.boundClassNames[a[0]], button: a[1] });
                        });
                        return d;
                    };
                    b.prototype.update = function (a) {
                        this.options = D(!0, this.options, a);
                        this.removeEvents();
                        this.initEvents();
                    };
                    b.prototype.removeEvents = function () {
                        this.eventsToUnbind.forEach(function (a) {
                            a();
                        });
                    };
                    b.prototype.destroy = function () {
                        this.removeEvents();
                    };
                    b.annotationsEditable = {
                        nestedOptions: {
                            labelOptions: ["style", "format", "backgroundColor"],
                            labels: ["style"],
                            label: ["style"],
                            style: ["fontSize", "color"],
                            background: ["fill", "strokeWidth", "stroke"],
                            innerBackground: ["fill", "strokeWidth", "stroke"],
                            outerBackground: ["fill", "strokeWidth", "stroke"],
                            shapeOptions: ["fill", "strokeWidth", "stroke"],
                            shapes: ["fill", "strokeWidth", "stroke"],
                            line: ["strokeWidth", "stroke"],
                            backgroundColors: [!0],
                            connector: ["fill", "strokeWidth", "stroke"],
                            crosshairX: ["strokeWidth", "stroke"],
                            crosshairY: ["strokeWidth", "stroke"],
                        },
                        circle: ["shapes"],
                        ellipse: ["shapes"],
                        verticalLine: [],
                        label: ["labelOptions"],
                        measure: ["background", "crosshairY", "crosshairX"],
                        fibonacci: [],
                        tunnel: ["background", "line", "height"],
                        pitchfork: ["innerBackground", "outerBackground"],
                        rect: ["shapes"],
                        crookedLine: [],
                        basicAnnotation: ["shapes", "labelOptions"],
                    };
                    b.annotationsNonEditable = { rectangle: ["crosshairX", "crosshairY", "labelOptions"], ellipse: ["labelOptions"], circle: ["labelOptions"] };
                    return b;
                })();
            x.prototype.utils = {
                getFieldType: function (a) {
                    return { string: "text", number: "number", boolean: "checkbox" }[typeof a];
                },
                updateRectSize: function (a, b) {
                    var c = b.chart,
                        d = b.options.typeOptions,
                        e = v(d.xAxis) && c.xAxis[d.xAxis],
                        f = v(d.yAxis) && c.yAxis[d.yAxis];
                    e &&
                        f &&
                        ((e = e.toValue(a[e.horiz ? "chartX" : "chartY"])),
                        (a = f.toValue(a[f.horiz ? "chartX" : "chartY"])),
                        (f = e - d.point.x),
                        (d = d.point.y - a),
                        b.update({ typeOptions: { background: { width: c.inverted ? d : f, height: c.inverted ? f : d } } }));
                },
                getAssignedAxis: function (a) {
                    return a.filter(function (a) {
                        var b = a.axis.getExtremes(),
                            c = b.min;
                        b = b.max;
                        var d = y(a.axis.minPointOffset, 0);
                        return v(c) && v(b) && a.value >= c - d && a.value <= b + d && !a.axis.options.isInternal;
                    })[0];
                },
            };
            l.prototype.initNavigationBindings = function () {
                var a = this.options;
                a && a.navigation && a.navigation.bindings && ((this.navigationBindings = new x(this, a.navigation)), this.navigationBindings.initEvents(), this.navigationBindings.initUpdate());
            };
            f(l, "load", function () {
                this.initNavigationBindings();
            });
            f(l, "destroy", function () {
                this.navigationBindings && this.navigationBindings.destroy();
            });
            f(x, "deselectButton", function () {
                this.selectedButtonElement = null;
            });
            f(c, "remove", function () {
                this.chart.navigationBindings && this.chart.navigationBindings.deselectAnnotation();
            });
            q.Annotation &&
                (b(c),
                A(c.types, function (a) {
                    b(a);
                }));
            k({
                lang: {
                    navigation: {
                        popup: {
                            simpleShapes: "Simple shapes",
                            lines: "Lines",
                            circle: "Circle",
                            ellipse: "Ellipse",
                            rectangle: "Rectangle",
                            label: "Label",
                            shapeOptions: "Shape options",
                            typeOptions: "Details",
                            fill: "Fill",
                            format: "Text",
                            strokeWidth: "Line width",
                            stroke: "Line color",
                            title: "Title",
                            name: "Name",
                            labelOptions: "Label options",
                            labels: "Labels",
                            backgroundColor: "Background color",
                            backgroundColors: "Background colors",
                            borderColor: "Border color",
                            borderRadius: "Border radius",
                            borderWidth: "Border width",
                            style: "Style",
                            padding: "Padding",
                            fontSize: "Font size",
                            color: "Color",
                            height: "Height",
                            shapes: "Shape options",
                        },
                    },
                },
                navigation: {
                    bindingsClassName: "highcharts-bindings-container",
                    bindings: {
                        circleAnnotation: {
                            className: "highcharts-circle-annotation",
                            start: function (a) {
                                var b = this.chart.pointer.getCoordinates(a);
                                a = this.utils.getAssignedAxis(b.xAxis);
                                b = this.utils.getAssignedAxis(b.yAxis);
                                var c = this.chart.options.navigation;
                                if (a && b)
                                    return this.chart.addAnnotation(
                                        D(
                                            { langKey: "circle", type: "basicAnnotation", shapes: [{ type: "circle", point: { x: a.value, y: b.value, xAxis: a.axis.options.index, yAxis: b.axis.options.index }, r: 5 }] },
                                            c.annotationsOptions,
                                            c.bindings.circleAnnotation.annotationsOptions
                                        )
                                    );
                            },
                            steps: [
                                function (a, b) {
                                    var c = b.options.shapes;
                                    c = (c && c[0] && c[0].point) || {};
                                    if (v(c.xAxis) && v(c.yAxis)) {
                                        var d = this.chart.inverted;
                                        var e = this.chart.xAxis[c.xAxis].toPixels(c.x);
                                        c = this.chart.yAxis[c.yAxis].toPixels(c.y);
                                        d = Math.max(Math.sqrt(Math.pow(d ? c - a.chartX : e - a.chartX, 2) + Math.pow(d ? e - a.chartY : c - a.chartY, 2)), 5);
                                    }
                                    b.update({ shapes: [{ r: d }] });
                                },
                            ],
                        },
                        ellipseAnnotation: {
                            className: "highcharts-ellipse-annotation",
                            start: function (a) {
                                var b = this.chart.pointer.getCoordinates(a);
                                a = this.utils.getAssignedAxis(b.xAxis);
                                b = this.utils.getAssignedAxis(b.yAxis);
                                var c = this.chart.options.navigation;
                                if (a && b)
                                    return this.chart.addAnnotation(
                                        D(
                                            {
                                                langKey: "ellipse",
                                                type: "basicAnnotation",
                                                shapes: [
                                                    {
                                                        type: "ellipse",
                                                        xAxis: a.axis.options.index,
                                                        yAxis: b.axis.options.index,
                                                        points: [
                                                            { x: a.value, y: b.value },
                                                            { x: a.value, y: b.value },
                                                        ],
                                                        ry: 1,
                                                    },
                                                ],
                                            },
                                            c.annotationsOptions,
                                            c.bindings.ellipseAnnotation.annotationOptions
                                        )
                                    );
                            },
                            steps: [
                                function (a, b) {
                                    b = b.shapes[0];
                                    var c = b.getAbsolutePosition(b.points[1]);
                                    b.translatePoint(a.chartX - c.x, a.chartY - c.y, 1);
                                    b.redraw(!1);
                                },
                                function (a, b) {
                                    b = b.shapes[0];
                                    var c = b.getAbsolutePosition(b.points[0]),
                                        d = b.getAbsolutePosition(b.points[1]);
                                    a = b.getDistanceFromLine(c, d, a.chartX, a.chartY);
                                    c = b.getYAxis();
                                    a = Math.abs(c.toValue(0) - c.toValue(a));
                                    b.setYRadius(a);
                                    b.redraw(!1);
                                },
                            ],
                        },
                        rectangleAnnotation: {
                            className: "highcharts-rectangle-annotation",
                            start: function (a) {
                                a = this.chart.pointer.getCoordinates(a);
                                var b = this.utils.getAssignedAxis(a.xAxis),
                                    c = this.utils.getAssignedAxis(a.yAxis);
                                if (b && c) {
                                    a = b.value;
                                    var d = c.value;
                                    b = b.axis.options.index;
                                    c = c.axis.options.index;
                                    var e = this.chart.options.navigation;
                                    return this.chart.addAnnotation(
                                        D(
                                            {
                                                langKey: "rectangle",
                                                type: "basicAnnotation",
                                                shapes: [
                                                    {
                                                        type: "path",
                                                        points: [{ xAxis: b, yAxis: c, x: a, y: d }, { xAxis: b, yAxis: c, x: a, y: d }, { xAxis: b, yAxis: c, x: a, y: d }, { xAxis: b, yAxis: c, x: a, y: d }, { command: "Z" }],
                                                    },
                                                ],
                                            },
                                            e.annotationsOptions,
                                            e.bindings.rectangleAnnotation.annotationsOptions
                                        )
                                    );
                                }
                            },
                            steps: [
                                function (a, b) {
                                    var c = b.options.shapes;
                                    c = (c && c[0] && c[0].points) || [];
                                    var d = this.chart.pointer.getCoordinates(a);
                                    a = this.utils.getAssignedAxis(d.xAxis);
                                    d = this.utils.getAssignedAxis(d.yAxis);
                                    a && d && ((a = a.value), (d = d.value), (c[1].x = a), (c[2].x = a), (c[2].y = d), (c[3].y = d), b.update({ shapes: [{ points: c }] }));
                                },
                            ],
                        },
                        labelAnnotation: {
                            className: "highcharts-label-annotation",
                            start: function (a) {
                                var b = this.chart.pointer.getCoordinates(a);
                                a = this.utils.getAssignedAxis(b.xAxis);
                                b = this.utils.getAssignedAxis(b.yAxis);
                                var c = this.chart.options.navigation;
                                if (a && b)
                                    return this.chart.addAnnotation(
                                        D(
                                            {
                                                langKey: "label",
                                                type: "basicAnnotation",
                                                labelOptions: { format: "{y:.2f}" },
                                                labels: [{ point: { xAxis: a.axis.options.index, yAxis: b.axis.options.index, x: a.value, y: b.value }, overflow: "none", crop: !0 }],
                                            },
                                            c.annotationsOptions,
                                            c.bindings.labelAnnotation.annotationsOptions
                                        )
                                    );
                            },
                        },
                    },
                    events: {},
                    annotationsOptions: { animation: { defer: 0 } },
                },
            });
            f(l, "render", function () {
                var a = this,
                    b = a.navigationBindings;
                if (a && b) {
                    var c = !1;
                    a.series.forEach(function (a) {
                        !a.options.isInternal && a.visible && (c = !0);
                    });
                    A(b.boundClassNames, function (b, d) {
                        if (a.navigationBindings && a.navigationBindings.container && a.navigationBindings.container[0] && (d = a.navigationBindings.container[0].querySelectorAll("." + d)))
                            for (var e = 0; e < d.length; e++) {
                                var f = d[e],
                                    g = f.className;
                                "normal" === b.noDataState
                                    ? -1 !== g.indexOf("highcharts-disabled-btn") && f.classList.remove("highcharts-disabled-btn")
                                    : c
                                    ? -1 !== g.indexOf("highcharts-disabled-btn") && f.classList.remove("highcharts-disabled-btn")
                                    : -1 === g.indexOf("highcharts-disabled-btn") && (f.className += " highcharts-disabled-btn");
                            }
                    });
                }
            });
            f(x, "closePopup", function () {
                this.deselectAnnotation();
            });
            return x;
        }
    );
    v(c, "Extensions/Annotations/Popup.js", [c["Core/Renderer/HTML/AST.js"], c["Core/Globals.js"], c["Extensions/Annotations/NavigationBindings.js"], c["Core/DefaultOptions.js"], c["Core/Pointer.js"], c["Core/Utilities.js"]], function (
        c,
        l,
        n,
        k,
        q,
        m
    ) {
        var e = l.doc,
            a = l.isFirefox,
            b = k.getOptions,
            d = m.addEvent,
            f = m.createElement,
            g = m.defined,
            h = m.fireEvent,
            p = m.isArray,
            u = m.isObject,
            v = m.objectEach,
            C = m.pick,
            D = m.stableSort;
        k = m.wrap;
        var A = /\d/g,
            y;
        (function (a) {
            a[(a["params.algorithm"] = 0)] = "params.algorithm";
            a[(a["params.average"] = 1)] = "params.average";
        })(y || (y = {}));
        var B = { "algorithm-pivotpoints": ["standard", "fibonacci", "camarilla"], "average-disparityindex": ["sma", "ema", "dema", "tema", "wma"] };
        k(q.prototype, "onContainerMouseDown", function (a, b) {
            this.inClass(b.target, "highcharts-popup") || a.apply(this, Array.prototype.slice.call(arguments, 1));
        });
        l.Popup = function (a, b, c) {
            this.init(a, b, c);
        };
        l.Popup.prototype = {
            init: function (a, b, c) {
                this.chart = c;
                this.container = f("div", { className: "highcharts-popup highcharts-no-tooltip" }, void 0, a);
                d(this.container, "mousedown", function () {
                    var a = c && c.navigationBindings && c.navigationBindings.activeAnnotation;
                    if (a) {
                        a.cancelClick = !0;
                        var b = d(l.doc, "click", function () {
                            setTimeout(function () {
                                a.cancelClick = !1;
                            }, 0);
                            b();
                        });
                    }
                });
                this.lang = this.getLangpack();
                this.iconsURL = b;
                this.addCloseBtn();
            },
            addCloseBtn: function () {
                var a = this,
                    b = this.iconsURL;
                var c = f("div", { className: "highcharts-popup-close" }, void 0, this.container);
                c.style["background-image"] = "url(" + (b.match(/png|svg|jpeg|jpg|gif/gi) ? b : b + "close.svg") + ")";
                ["click", "touchstart"].forEach(function (b) {
                    d(c, b, function () {
                        a.chart ? h(a.chart.navigationBindings, "closePopup") : a.closePopup();
                    });
                });
            },
            addColsContainer: function (a) {
                var b = f("div", { className: "highcharts-popup-lhs-col" }, void 0, a);
                a = f("div", { className: "highcharts-popup-rhs-col" }, void 0, a);
                f("div", { className: "highcharts-popup-rhs-col-wrapper" }, void 0, a);
                return { lhsCol: b, rhsCol: a };
            },
            addInput: function (a, b, c, d) {
                var g = a.split(".");
                g = g[g.length - 1];
                var h = this.lang;
                b = "highcharts-" + b + "-" + C(d.htmlFor, g);
                b.match(A) || f("label", { htmlFor: b, className: d.labelClassName }, void 0, c).appendChild(e.createTextNode(h[g] || g));
                c = f("input", { name: b, value: d.value, type: d.type, className: "highcharts-popup-field" }, void 0, c);
                c.setAttribute("highcharts-data-name", a);
                return c;
            },
            addButton: function (a, b, c, g, h) {
                var l = this,
                    x = this.closePopup,
                    k = this.getFields;
                var t = f("button", void 0, void 0, a);
                t.appendChild(e.createTextNode(b));
                h &&
                    ["click", "touchstart"].forEach(function (a) {
                        d(t, a, function () {
                            x.call(l);
                            return h(k(g, c));
                        });
                    });
                return t;
            },
            getFields: function (a, b) {
                var c = Array.prototype.slice.call(a.querySelectorAll("input")),
                    d = Array.prototype.slice.call(a.querySelectorAll("select")),
                    e = a.querySelectorAll("#highcharts-select-series > option:checked")[0];
                a = a.querySelectorAll("#highcharts-select-volume > option:checked")[0];
                var f = { actionType: b, linkedTo: (e && e.getAttribute("value")) || "", fields: {} };
                c.forEach(function (a) {
                    var b = a.getAttribute("highcharts-data-name");
                    a.getAttribute("highcharts-data-series-id") ? (f.seriesId = a.value) : b ? (f.fields[b] = a.value) : (f.type = a.value);
                });
                d.forEach(function (a) {
                    var b = a.id;
                    "highcharts-select-series" !== b && "highcharts-select-volume" !== b && ((b = b.split("highcharts-select-")[1]), (f.fields[b] = a.value));
                });
                a && (f.fields["params.volumeSeriesID"] = a.getAttribute("value") || "");
                return f;
            },
            showPopup: function () {
                var a = this.container,
                    b = a.querySelectorAll(".highcharts-popup-close")[0];
                this.formType = void 0;
                a.innerHTML = c.emptyHTML;
                0 <= a.className.indexOf("highcharts-annotation-toolbar") && (a.classList.remove("highcharts-annotation-toolbar"), a.removeAttribute("style"));
                a.appendChild(b);
                a.style.display = "block";
                a.style.height = "";
            },
            closePopup: function () {
                C(this.popup && this.popup.container, this.container).style.display = "none";
            },
            showForm: function (a, b, c, d) {
                b &&
                    ((this.popup = b.navigationBindings.popup),
                    this.showPopup(),
                    "indicators" === a && this.indicators.addForm.call(this, b, c, d),
                    "annotation-toolbar" === a && this.annotations.addToolbar.call(this, b, c, d),
                    "annotation-edit" === a && this.annotations.addForm.call(this, b, c, d),
                    "flag" === a && this.annotations.addForm.call(this, b, c, d, !0),
                    (this.formType = a),
                    (this.container.style.height = this.container.offsetHeight + "px"));
            },
            getLangpack: function () {
                return b().lang.navigation.popup;
            },
            annotations: {
                addToolbar: function (a, b, c) {
                    var d = this,
                        g = this.lang,
                        h = this.popup.container,
                        l = this.showForm;
                    -1 === h.className.indexOf("highcharts-annotation-toolbar") && (h.className += " highcharts-annotation-toolbar");
                    a && (h.style.top = a.plotTop + 10 + "px");
                    f("span", void 0, void 0, h).appendChild(e.createTextNode(C(g[b.langKey] || b.langKey, b.shapes && b.shapes[0].type, "")));
                    var k = this.addButton(h, g.removeButton || "remove", "remove", h, c);
                    k.className += " highcharts-annotation-remove-button";
                    k.style["background-image"] = "url(" + this.iconsURL + "destroy.svg)";
                    k = this.addButton(h, g.editButton || "edit", "edit", h, function () {
                        l.call(d, "annotation-edit", a, b, c);
                    });
                    k.className += " highcharts-annotation-edit-button";
                    k.style["background-image"] = "url(" + this.iconsURL + "edit.svg)";
                },
                addForm: function (a, b, c, d) {
                    var g = this.popup.container,
                        h = this.lang;
                    if (a) {
                        var k = f("h2", { className: "highcharts-popup-main-title" }, void 0, g);
                        k.appendChild(e.createTextNode(h[b.langKey] || b.langKey || ""));
                        k = f("div", { className: "highcharts-popup-lhs-col highcharts-popup-lhs-full" }, void 0, g);
                        var l = f("div", { className: "highcharts-popup-bottom-row" }, void 0, g);
                        this.annotations.addFormFields.call(this, k, a, "", b, [], !0);
                        this.addButton(l, d ? h.addButton || "add" : h.saveButton || "save", d ? "add" : "save", g, c);
                    }
                },
                addFormFields: function (b, c, d, g, h, k) {
                    var l = this,
                        m = this.annotations.addFormFields,
                        x = this.addInput,
                        t = this.lang,
                        n,
                        w;
                    c &&
                        (v(g, function (a, e) {
                            n = "" !== d ? d + "." + e : e;
                            u(a) && (!p(a) || (p(a) && u(a[0])) ? ((w = t[e] || e), w.match(A) || h.push([!0, w, b]), m.call(l, b, c, n, a, h, !1)) : h.push([l, n, "annotation", b, a]));
                        }),
                        k &&
                            (D(h, function (a) {
                                return a[1].match(/format/g) ? -1 : 1;
                            }),
                            a && h.reverse(),
                            h.forEach(function (a) {
                                !0 === a[0] ? f("span", { className: "highcharts-annotation-title" }, void 0, a[2]).appendChild(e.createTextNode(a[1])) : ((a[4] = { value: a[4][0], type: a[4][1] }), x.apply(a[0], a.splice(1)));
                            })));
                },
            },
            indicators: {
                addForm: function (a, b, c) {
                    var d = this.indicators,
                        e = this.lang;
                    if (a) {
                        this.tabs.init.call(this, a);
                        b = this.popup.container.querySelectorAll(".highcharts-tab-item-content");
                        this.addColsContainer(b[0]);
                        d.addSearchBox.call(this, a, b[0]);
                        d.addIndicatorList.call(this, a, b[0], "add");
                        var f = b[0].querySelectorAll(".highcharts-popup-rhs-col")[0];
                        this.addButton(f, e.addButton || "add", "add", f, c);
                        this.addColsContainer(b[1]);
                        d.addIndicatorList.call(this, a, b[1], "edit");
                        f = b[1].querySelectorAll(".highcharts-popup-rhs-col")[0];
                        this.addButton(f, e.saveButton || "save", "edit", f, c);
                        this.addButton(f, e.removeButton || "remove", "remove", f, c);
                    }
                },
                filterSeries: function (a, b) {
                    var c = this.indicators,
                        d = this.chart && this.chart.options.lang,
                        e = d && d.navigation && d.navigation.popup && d.navigation.popup.indicatorAliases,
                        f = [],
                        g;
                    v(a, function (a, d) {
                        var h = a.options;
                        if (a.params || (h && h.params))
                            if (((h = c.getNameType(a, d)), (d = h.indicatorFullName), (h = h.indicatorType), b)) {
                                var k = b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                k = new RegExp(k, "i");
                                var l = (e && e[h] && e[h].join(" ")) || "";
                                if (d.match(k) || l.match(k)) (g = { indicatorFullName: d, indicatorType: h, series: a }), f.push(g);
                            } else (g = { indicatorFullName: d, indicatorType: h, series: a }), f.push(g);
                    });
                    return f;
                },
                filterSeriesArray: function (a) {
                    var b = [],
                        c;
                    a.forEach(function (a) {
                        a.is("sma") && ((c = { indicatorFullName: a.name, indicatorType: a.type, series: a }), b.push(c));
                    });
                    return b;
                },
                addIndicatorList: function (a, b, g, h) {
                    var k = this,
                        l = k.indicators,
                        m = k.lang,
                        n = b.querySelectorAll(".highcharts-popup-lhs-col")[0];
                    b = b.querySelectorAll(".highcharts-popup-rhs-col")[0];
                    var t = "edit" === g,
                        x = this.indicators.addFormFields;
                    g = t ? a.series : a.options.plotOptions || {};
                    if (a || !g) {
                        var w,
                            E = [];
                        t || p(g) ? p(g) && (E = l.filterSeriesArray.call(this, g)) : (E = l.filterSeries.call(this, g, h));
                        D(E, function (a, b) {
                            a = a.indicatorFullName.toLowerCase();
                            b = b.indicatorFullName.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        });
                        n.children[1] && n.children[1].remove();
                        var r = f("ul", { className: "highcharts-indicator-list" }, void 0, n);
                        var q = b.querySelectorAll(".highcharts-popup-rhs-col-wrapper")[0];
                        E.forEach(function (b) {
                            var c = b.indicatorFullName,
                                g = b.indicatorType,
                                h = b.series;
                            w = f("li", { className: "highcharts-indicator-list" }, void 0, r);
                            w.appendChild(e.createTextNode(c));
                            ["click", "touchstart"].forEach(function (b) {
                                d(w, b, function () {
                                    var b = q.parentNode.children[1];
                                    x.call(k, a, h, g, q);
                                    b && (b.style.display = "block");
                                    t && h.options && f("input", { type: "hidden", name: "highcharts-id-" + g, value: h.options.id }, void 0, q).setAttribute("highcharts-data-series-id", h.options.id);
                                });
                            });
                        });
                        0 < r.childNodes.length ? r.childNodes[0].click() : t || (c.setElementHTML(q.parentNode.children[0], m.noFilterMatch || ""), (q.parentNode.children[1].style.display = "none"));
                    }
                },
                addSearchBox: function (a, b) {
                    var c = this,
                        e = b.querySelectorAll(".highcharts-popup-lhs-col")[0];
                    b = this.lang.clearFilter;
                    e = f("div", { className: "highcharts-input-wrapper" }, void 0, e);
                    var g = function (b) {
                            c.indicators.addIndicatorList.call(c, a, c.container, "add", b);
                        },
                        h = this.addInput("searchIndicators", "input", e, { value: "", type: "text", htmlFor: "search-indicators", labelClassName: "highcharts-input-search-indicators-label" }),
                        k = f("a", { textContent: b }, void 0, e);
                    h.classList.add("highcharts-input-search-indicators");
                    k.classList.add("clear-filter-button");
                    d(h, "input", function (a) {
                        g(this.value);
                        k.style.display = this.value.length ? "inline-block" : "none";
                    });
                    ["click", "touchstart"].forEach(function (a) {
                        d(k, a, function () {
                            h.value = "";
                            g("");
                            k.style.display = "none";
                        });
                    });
                },
                addSelection: function (a, b, c) {
                    var d = b.split(".");
                    d = d[d.length - 1];
                    a = "highcharts-" + b + "-type-" + a;
                    var g = this.lang;
                    f("label", { htmlFor: a }, null, c).appendChild(e.createTextNode(g[d] || b));
                    c = f("select", { name: a, className: "highcharts-popup-field", id: "highcharts-select-" + b }, null, c);
                    c.setAttribute("id", "highcharts-select-" + b);
                    return c;
                },
                addSelectionOptions: function (a, b, c, d, h, k, l) {
                    "series" === b || "volume" === b
                        ? a.series.forEach(function (a) {
                              var d = a.options,
                                  h = d.name || d.params ? a.name : d.id || "";
                              "highcharts-navigator-series" !== d.id &&
                                  d.id !== (l && l.options && l.options.id) &&
                                  (g(k) || "volume" !== b || "column" !== a.type || (k = d.id), f("option", { value: d.id }, void 0, c).appendChild(e.createTextNode(h)));
                          })
                        : d &&
                          h &&
                          B[h + "-" + d].forEach(function (a) {
                              f("option", { value: a }, void 0, c).appendChild(e.createTextNode(a));
                          });
                    g(k) && (c.value = k);
                },
                getNameType: function (a, b) {
                    var c = a.options,
                        d = l.seriesTypes;
                    d = (d[b] && d[b].prototype.nameBase) || b.toUpperCase();
                    c && c.type && ((b = a.options.type), (d = a.name));
                    return { indicatorFullName: d, indicatorType: b };
                },
                listAllSeries: function (a, b, c, d, e, f) {
                    var h = this.indicators;
                    c && ((a = h.addSelection.call(this, a, b, d)), h.addSelectionOptions.call(this, c, b, a, void 0, void 0, void 0, e), g(f) && (a.value = f));
                },
                addFormFields: function (a, b, d, g) {
                    var h = b.params || b.options.params,
                        k = this.indicators.getNameType;
                    g.innerHTML = c.emptyHTML;
                    f("h3", { className: "highcharts-indicator-title" }, void 0, g).appendChild(e.createTextNode(k(b, d).indicatorFullName));
                    f("input", { type: "hidden", name: "highcharts-type-" + d, value: d }, void 0, g);
                    this.indicators.listAllSeries.call(this, d, "series", a, g, b, b.linkedParent && b.linkedParent.options.id);
                    h.volumeSeriesID && this.indicators.listAllSeries.call(this, d, "volume", a, g, b, b.linkedParent && h.volumeSeriesID);
                    this.indicators.addParamInputs.call(this, a, "params", h, d, g);
                },
                addParamInputs: function (a, b, c, d, e) {
                    var f = this,
                        h = f.indicators,
                        k = this.indicators.addParamInputs,
                        l = this.addInput,
                        m;
                    a &&
                        v(c, function (c, n) {
                            m = b + "." + n;
                            if (g(c) && m)
                                if ((u(c) && (l.call(f, m, d, e, {}), k.call(f, a, m, c, d, e)), m in y)) {
                                    var t = h.addSelection.call(f, d, m, e);
                                    h.addSelectionOptions.call(f, a, b, t, d, n, c);
                                } else "params.volumeSeriesID" === m || p(c) || l.call(f, m, d, e, { value: c, type: "text" });
                        });
                },
                getAmount: function () {
                    var a = 0;
                    this.series.forEach(function (b) {
                        var c = b.options;
                        (b.params || (c && c.params)) && a++;
                    });
                    return a;
                },
            },
            tabs: {
                init: function (a) {
                    var b = this.tabs,
                        c = this.indicators.getAmount.call(a);
                    a && ((a = b.addMenuItem.call(this, "add")), b.addMenuItem.call(this, "edit", c), b.addContentItem.call(this, "add"), b.addContentItem.call(this, "edit"), b.switchTabs.call(this, c), b.selectTab.call(this, a, 0));
                },
                addMenuItem: function (a, b) {
                    var c = this.popup.container,
                        d = "highcharts-tab-item",
                        g = this.lang;
                    0 === b && (d += " highcharts-tab-disabled");
                    b = f("span", { className: d }, void 0, c);
                    b.appendChild(e.createTextNode(g[a + "Button"] || a));
                    b.setAttribute("highcharts-data-tab-type", a);
                    return b;
                },
                addContentItem: function () {
                    return f("div", { className: "highcharts-tab-item-content highcharts-no-mousewheel" }, void 0, this.popup.container);
                },
                switchTabs: function (a) {
                    var b = this,
                        c;
                    this.popup.container.querySelectorAll(".highcharts-tab-item").forEach(function (e, f) {
                        c = e.getAttribute("highcharts-data-tab-type");
                        ("edit" === c && 0 === a) ||
                            ["click", "touchstart"].forEach(function (a) {
                                d(e, a, function () {
                                    b.tabs.deselectAll.call(b);
                                    b.tabs.selectTab.call(b, this, f);
                                });
                            });
                    });
                },
                selectTab: function (a, b) {
                    var c = this.popup.container.querySelectorAll(".highcharts-tab-item-content");
                    a.className += " highcharts-tab-item-active";
                    c[b].className += " highcharts-tab-item-show";
                },
                deselectAll: function () {
                    var a = this.popup.container,
                        b = a.querySelectorAll(".highcharts-tab-item");
                    a = a.querySelectorAll(".highcharts-tab-item-content");
                    var c;
                    for (c = 0; c < b.length; c++) b[c].classList.remove("highcharts-tab-item-active"), a[c].classList.remove("highcharts-tab-item-show");
                },
            },
        };
        d(n, "showPopup", function (a) {
            this.popup ||
                (this.popup = new l.Popup(
                    this.chart.container,
                    this.chart.options.navigation.iconsURL || (this.chart.options.stockTools && this.chart.options.stockTools.gui.iconsURL) || "https://code.highcharts.com/10.2.0/gfx/stock-icons/",
                    this.chart
                ));
            this.popup.showForm(a.formType, this.chart, a.options, a.onSubmit);
        });
        d(n, "closePopup", function () {
            this.popup && this.popup.closePopup();
        });
        return l.Popup;
    });
    v(c, "masters/modules/annotations-advanced.src.js", [], function () {});
});
//# sourceMappingURL=annotations-advanced.js.map
