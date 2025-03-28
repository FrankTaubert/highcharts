/* *
 *
 *  Highcharts Drilldown module
 *
 *  Author: Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type {
    AlignObject,
    AlignValue,
    VerticalAlignValue
} from '../Core/Renderer/AlignObject';
import type AnimationOptions from '../Core/Animation/AnimationOptions';
import type BBoxObject from '../Core/Renderer/BBoxObject';
import type { ButtonRelativeToValue } from '../Maps/MapNavigationOptions';
import type ColorType from '../Core/Color/ColorType';
import type {
    CSSObject,
    CursorValue
} from '../Core/Renderer/CSSObject';
import type Options from '../Core/Options';
import type {
    PointOptions,
    PointShortOptions
} from '../Core/Series/PointOptions';
import type SeriesOptions from '../Core/Series/SeriesOptions';
import type { SeriesTypeOptions } from '../Core/Series/SeriesType';
import type SVGAttributes from '../Core/Renderer/SVG/SVGAttributes';
import type SVGElement from '../Core/Renderer/SVG/SVGElement';
import A from '../Core/Animation/AnimationUtilities.js';
const { animObject } = A;
import Axis from '../Core/Axis/Axis.js';
import Chart from '../Core/Chart/Chart.js';
import Color from '../Core/Color/Color.js';
import ColumnSeries from '../Series/Column/ColumnSeries.js';
import F from '../Core/FormatUtilities.js';
const { format } = F;
import H from '../Core/Globals.js';
const { noop } = H;
import D from '../Core/DefaultOptions.js';
const { defaultOptions } = D;
import { Palette } from '../Core/Color/Palettes.js';
import Point from '../Core/Series/Point.js';
import Series from '../Core/Series/Series.js';
import SeriesRegistry from '../Core/Series/SeriesRegistry.js';
const { seriesTypes } = SeriesRegistry;
import SVGRenderer from '../Core/Renderer/SVG/SVGRenderer.js';
import Tick from '../Core/Axis/Tick.js';
import U from '../Core/Utilities.js';
const {
    addEvent,
    removeEvent,
    extend,
    fireEvent,
    merge,
    objectEach,
    pick,
    syncTimeout
} = U;

declare module '../Core/Axis/AxisLike' {
    interface AxisLike {
        ddPoints?: Record<string, Array<(false|Point)>>;
        oldPos?: number;
        drilldownCategory(x: number, e: MouseEvent): void;
        getDDPoints(x: number): Array<(false|Point)>;
    }
}

declare module '../Core/Axis/TickLike' {
    interface TickLike {
        drillable(): void;
    }
}

declare module '../Core/Chart/ChartLike' {
    interface ChartLike {
        ddDupes?: Array<string>;
        drilldown?: Highcharts.ChartDrilldownObject;
        drilldownLevels?: Array<Highcharts.DrilldownLevelObject>;
        drillUpButton?: SVGElement;
        addSeriesAsDrilldown(
            point: Point,
            options: SeriesTypeOptions
        ): void;
        addSingleSeriesAsDrilldown(
            point: Point,
            ddOptions: SeriesTypeOptions
        ): void;
        applyDrilldown(): void;
        drillUp(): void;
        getDrilldownBackText(): (string|undefined);
        showDrillUpButton(): void;
    }
}

declare module '../Core/Options'{
    interface Options {
        drilldown?: Highcharts.DrilldownOptions;
    }
}

declare module '../Core/LangOptions' {
    interface LangOptions {
        drillUpText?: string;
    }
}

declare module '../Core/Renderer/SVG/SVGElementLike' {
    interface SVGElementLike {
        fadeIn(animation?: (boolean|Partial<AnimationOptions>)): void;
    }
}

declare module '../Core/Series/PointLike' {
    interface PointLike {
        drilldown?: string;
        doDrilldown(): void;
        runDrilldown(
            holdRedraw?: boolean,
            category?: number,
            originalEvent?: Event
        ): void;
        unbindDrilldownClick?: Function;
    }
}

declare module '../Core/Series/SeriesLike' {
    interface SeriesLike {
        drilldownLevel?: Highcharts.DrilldownLevelObject;
        isDrilling?: boolean;
        purgedOptions?: SeriesTypeOptions;
        /** @requires Extensions/Drilldown */
        animateDrilldown(init?: boolean): void;
        /** @requires Extensions/Drilldown */
        animateDrillupFrom(level: Highcharts.DrilldownLevelObject): void;
        /** @requires Extensions/Drilldown */
        animateDrillupTo(init?: boolean): void;
    }
}

declare module '../Core/Series/SeriesOptions' {
    interface SeriesOptions {
        _colorIndex?: number;
        _ddSeriesId?: number;
        _levelNumber?: number;
        drilldown?: string;
    }
}

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        interface ChartDrilldownObject {
            update(options: DrilldownOptions, redraw?: boolean): void;
        }
        interface ChartEventsOptions {
            drilldown?: DrilldownCallbackFunction;
            drillup?: DrillupCallbackFunction;
            drillupall?: DrillupAllCallbackFunction;
        }
        interface DrilldownActiveDataLabelStyleOptions {
            color?: string;
            cursor?: string;
            fontWeight?: string;
            textDecoration?: string;
        }
        interface DrilldownDrillUpButtonOptions {
            position?: (AlignObject|DrilldownDrillUpButtonPositionOptions);
            relativeTo?: ButtonRelativeToValue;
            theme?: object;
        }
        interface DrilldownDrillUpButtonPositionOptions {
            align?: AlignValue;
            verticalAlign?: VerticalAlignValue;
            x?: number;
            y?: number;
        }
        interface DrilldownCallbackFunction {
            (this: Chart, e: DrilldownEventObject): void;
        }
        interface DrilldownEventObject {
            category?: number;
            originalEvent?: Event;
            point: Point;
            points?: Array<(boolean|Point)>;
            preventDefault: Function;
            seriesOptions?: SeriesTypeOptions;
            target: Chart;
            type: 'drilldown';
        }
        interface DrilldownOptions {
            activeAxisLabelStyle?: CSSObject;
            activeDataLabelStyle?: (
                CSSObject|DrilldownActiveDataLabelStyleOptions
            );
            allowPointDrilldown?: boolean;
            animation?: (boolean|Partial<AnimationOptions>);
            drillUpButton?: DrilldownDrillUpButtonOptions;
            series?: Array<SeriesTypeOptions>;
        }
        interface DrilldownLevelObject {
            bBox: (BBoxObject|Record<string, undefined>);
            color?: ColorType;
            colorIndex?: number;
            levelNumber: number;
            levelSeries: Array<Series>;
            levelSeriesOptions: Array<SeriesOptions>;
            lowerSeries: Series;
            lowerSeriesOptions: SeriesOptions;
            oldExtremes: Record<string, (number|undefined)>;
            pointIndex: number;
            pointOptions: (PointOptions|PointShortOptions);
            seriesOptions: SeriesOptions;
            seriesPurgedOptions: SeriesOptions;
            shapeArgs?: SVGAttributes;
            resetZoomButton: SVGElement;
        }
        interface DrillupAllCallbackFunction {
            (this: Chart, e: DrillupAllEventObject): void;
        }
        interface DrillupAllEventObject {
            preventDefault: Function;
            target: Chart;
            type: 'drillupall';
        }
        interface DrillupCallbackFunction {
            (this: Chart, e: DrillupEventObject): void;
        }
        interface DrillupEventObject {
            preventDefault: Function;
            seriesOptions?: SeriesTypeOptions;
            target: Chart;
            type: 'drillup';
        }
        interface Tick {
            drillable(): void;
        }
    }
}

/**
 * Gets fired when a drilldown point is clicked, before the new series is added.
 * Note that when clicking a category label to trigger multiple series
 * drilldown, one `drilldown` event is triggered per point in the category.
 *
 * @callback Highcharts.DrilldownCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart where the event occurs.
 *
 * @param {Highcharts.DrilldownEventObject} e
 *        The drilldown event.
 */

/**
 * The event arguments when a drilldown point is clicked.
 *
 * @interface Highcharts.DrilldownEventObject
 *//**
 * If a category label was clicked, which index.
 * @name Highcharts.DrilldownEventObject#category
 * @type {number|undefined}
 *//**
 * The original browser event (usually click) that triggered the drilldown.
 * @name Highcharts.DrilldownEventObject#originalEvent
 * @type {global.Event|undefined}
 *//**
 * Prevents the default behaviour of the event.
 * @name Highcharts.DrilldownEventObject#preventDefault
 * @type {Function}
 *//**
 * The originating point.
 * @name Highcharts.DrilldownEventObject#point
 * @type {Highcharts.Point}
 *//**
 * If a category label was clicked, this array holds all points corresponding to
 * the category. Otherwise it is set to false.
 * @name Highcharts.DrilldownEventObject#points
 * @type {boolean|Array<Highcharts.Point>|undefined}
 *//**
 * Options for the new series. If the event is utilized for async drilldown, the
 * seriesOptions are not added, but rather loaded async.
 * @name Highcharts.DrilldownEventObject#seriesOptions
 * @type {Highcharts.SeriesOptionsType|undefined}
 *//**
 * The event target.
 * @name Highcharts.DrilldownEventObject#target
 * @type {Highcharts.Chart}
 *//**
 * The event type.
 * @name Highcharts.DrilldownEventObject#type
 * @type {"drilldown"}
 */

/**
 * This gets fired after all the series have been drilled up. This is especially
 * usefull in a chart with multiple drilldown series.
 *
 * @callback Highcharts.DrillupAllCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart where the event occurs.
 *
 * @param {Highcharts.DrillupAllEventObject} e
 *        The final drillup event.
 */

/**
 * The event arguments when all the series have been drilled up.
 *
 * @interface Highcharts.DrillupAllEventObject
 *//**
 * Prevents the default behaviour of the event.
 * @name Highcharts.DrillupAllEventObject#preventDefault
 * @type {Function}
 *//**
 * The event target.
 * @name Highcharts.DrillupAllEventObject#target
 * @type {Highcharts.Chart}
 *//**
 * The event type.
 * @name Highcharts.DrillupAllEventObject#type
 * @type {"drillupall"}
 */

/**
 * Gets fired when drilling up from a drilldown series.
 *
 * @callback Highcharts.DrillupCallbackFunction
 *
 * @param {Highcharts.Chart} this
 *        The chart where the event occurs.
 *
 * @param {Highcharts.DrillupEventObject} e
 *        The drillup event.
 */

/**
 * The event arguments when drilling up from a drilldown series.
 *
 * @interface Highcharts.DrillupEventObject
 *//**
 * Prevents the default behaviour of the event.
 * @name Highcharts.DrillupEventObject#preventDefault
 * @type {Function}
 *//**
 * Options for the new series.
 * @name Highcharts.DrillupEventObject#seriesOptions
 * @type {Highcharts.SeriesOptionsType|undefined}
 *//**
 * The event target.
 * @name Highcharts.DrillupEventObject#target
 * @type {Highcharts.Chart}
 *//**
 * The event type.
 * @name Highcharts.DrillupEventObject#type
 * @type {"drillup"}
 */

import '../Series/Column/ColumnSeries.js';

let PieSeries = seriesTypes.pie,
    ddSeriesId = 1;

// Add language
extend(
    defaultOptions.lang,
    /**
     * @optionparent lang
     */
    {
        /**
         * The text for the button that appears when drilling down, linking back
         * to the parent series. The parent series' name is inserted for
         * `{series.name}`.
         *
         * @since    3.0.8
         * @product  highcharts highmaps
         * @requires modules/drilldown
         *
         * @private
         */
        drillUpText: '◁ Back to {series.name}'
    }
);

/**
 * Options for drill down, the concept of inspecting increasingly high
 * resolution data through clicking on chart items like columns or pie slices.
 *
 * The drilldown feature requires the drilldown.js file to be loaded,
 * found in the modules directory of the download package, or online at
 * [code.highcharts.com/modules/drilldown.js
 * ](https://code.highcharts.com/modules/drilldown.js).
 *
 * @product      highcharts highmaps
 * @requires     modules/drilldown
 * @optionparent drilldown
 * @sample {highcharts} highcharts/series-organization/drilldown
 *         Organization chart drilldown
 */
defaultOptions.drilldown = {

    /**
     * When this option is false, clicking a single point will drill down
     * all points in the same category, equivalent to clicking the X axis
     * label.
     *
     * @sample {highcharts} highcharts/drilldown/allowpointdrilldown-false/
     *         Don't allow point drilldown
     *
     * @type      {boolean}
     * @default   true
     * @since     4.1.7
     * @product   highcharts
     * @apioption drilldown.allowPointDrilldown
     */

    /**
     * An array of series configurations for the drill down. Each series
     * configuration uses the same syntax as the [series](#series) option set.
     * These drilldown series are hidden by default. The drilldown series is
     * linked to the parent series' point by its `id`.
     *
     * @type      {Array<Highcharts.SeriesOptionsType>}
     * @since     3.0.8
     * @product   highcharts highmaps
     * @apioption drilldown.series
     */

    /**
     * Additional styles to apply to the X axis label for a point that
     * has drilldown data. By default it is underlined and blue to invite
     * to interaction.
     *
     * In styled mode, active label styles can be set with the
     * `.highcharts-drilldown-axis-label` class.
     *
     * @sample {highcharts} highcharts/drilldown/labels/
     *         Label styles
     *
     * @type    {Highcharts.CSSObject}
     * @default { "cursor": "pointer", "color": "#003399", "fontWeight": "bold", "textDecoration": "underline" }
     * @since   3.0.8
     * @product highcharts highmaps
     */
    activeAxisLabelStyle: {
        /** @ignore-option */
        cursor: 'pointer',
        /** @ignore-option */
        color: Palette.highlightColor100,
        /** @ignore-option */
        fontWeight: 'bold',
        /** @ignore-option */
        textDecoration: 'underline'
    },

    /**
     * Additional styles to apply to the data label of a point that has
     * drilldown data. By default it is underlined and blue to invite to
     * interaction.
     *
     * In styled mode, active data label styles can be applied with the
     * `.highcharts-drilldown-data-label` class.
     *
     * @sample {highcharts} highcharts/drilldown/labels/
     *         Label styles
     *
     * @type    {Highcharts.CSSObject}
     * @default { "cursor": "pointer", "color": "#003399", "fontWeight": "bold", "textDecoration": "underline" }
     * @since   3.0.8
     * @product highcharts highmaps
     */
    activeDataLabelStyle: {
        cursor: 'pointer',
        color: Palette.highlightColor100,
        fontWeight: 'bold',
        textDecoration: 'underline'
    },

    /**
     * Set the animation for all drilldown animations. Animation of a drilldown
     * occurs when drilling between a column point and a column series,
     * or a pie slice and a full pie series. Drilldown can still be used
     * between series and points of different types, but animation will
     * not occur.
     *
     * The animation can either be set as a boolean or a configuration
     * object. If `true`, it will use the 'swing' jQuery easing and a duration
     * of 500 ms. If used as a configuration object, the following properties
     * are supported:
     *
     * - `duration`: The duration of the animation in milliseconds.
     *
     * - `easing`: A string reference to an easing function set on the `Math`
     *   object. See
     *   [the easing demo](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/plotoptions/series-animation-easing/).
     *
     * @type    {boolean|Partial<Highcharts.AnimationOptionsObject>}
     * @since   3.0.8
     * @product highcharts highmaps
     */
    animation: {
        /** @internal */
        duration: 500
    },

    /**
     * Options for the drill up button that appears when drilling down on a
     * series. The text for the button is defined in
     * [lang.drillUpText](#lang.drillUpText).
     *
     * @sample {highcharts} highcharts/drilldown/drillupbutton/
     *         Drill up button
     * @sample {highmaps} highcharts/drilldown/drillupbutton/
     *         Drill up button
     *
     * @since   3.0.8
     * @product highcharts highmaps
     */
    drillUpButton: {
        /**
         * What box to align the button to. Can be either `plotBox` or
         * `spacingBox`.
         *
         * @type       {Highcharts.ButtonRelativeToValue}
         * @default    plotBox
         * @since      3.0.8
         * @product    highcharts highmaps
         * @apioption  drilldown.drillUpButton.relativeTo
         */

        /**
         * A collection of attributes for the button. The object takes SVG
         * attributes like `fill`, `stroke`, `stroke-width` or `r`, the border
         * radius. The theme also supports `style`, a collection of CSS
         * properties for the text. Equivalent attributes for the hover state
         * are given in `theme.states.hover`.
         *
         * In styled mode, drill-up button styles can be applied with the
         * `.highcharts-drillup-button` class.
         *
         * @sample {highcharts} highcharts/drilldown/drillupbutton/
         *         Button theming
         * @sample {highmaps} highcharts/drilldown/drillupbutton/
         *         Button theming
         *
         * @type      {Object}
         * @since     3.0.8
         * @product   highcharts highmaps
         * @apioption drilldown.drillUpButton.theme
         */

        /**
         * Positioning options for the button within the `relativeTo` box.
         * Available properties are `x`, `y`, `align` and `verticalAlign`.
         *
         * @type    {Highcharts.AlignObject}
         * @since   3.0.8
         * @product highcharts highmaps
         */
        position: {

            /**
             * Vertical alignment of the button.
             *
             * @type      {Highcharts.VerticalAlignValue}
             * @default   top
             * @product   highcharts highmaps
             * @apioption drilldown.drillUpButton.position.verticalAlign
             */

            /**
             * Horizontal alignment.
             *
             * @type {Highcharts.AlignValue}
             */
            align: 'right',

            /**
             * The X offset of the button.
             */
            x: -10,

            /**
             * The Y offset of the button.
             */
            y: 10
        }
    }
};


/**
 * Fires when a drilldown point is clicked, before the new series is added. This
 * event is also utilized for async drilldown, where the seriesOptions are not
 * added by option, but rather loaded async. Note that when clicking a category
 * label to trigger multiple series drilldown, one `drilldown` event is
 * triggered per point in the category.
 *
 * Event arguments:
 *
 * - `category`: If a category label was clicked, which index.
 *
 * - `originalEvent`: The original browser event (usually click) that triggered
 *   the drilldown.
 *
 * - `point`: The originating point.
 *
 * - `points`: If a category label was clicked, this array holds all points
 *   corresponding to the category.
 *
 * - `seriesOptions`: Options for the new series.
 *
 * @sample {highcharts} highcharts/drilldown/async/
 *         Async drilldown
 *
 * @type      {Highcharts.DrilldownCallbackFunction}
 * @since     3.0.8
 * @product   highcharts highmaps
 * @context   Highcharts.Chart
 * @requires  modules/drilldown
 * @apioption chart.events.drilldown
 */

/**
 * Fires when drilling up from a drilldown series.
 *
 * @type      {Highcharts.DrillupCallbackFunction}
 * @since     3.0.8
 * @product   highcharts highmaps
 * @context   Highcharts.Chart
 * @requires  modules/drilldown
 * @apioption chart.events.drillup
 */

/**
 * In a chart with multiple drilldown series, this event fires after all the
 * series have been drilled up.
 *
 * @type      {Highcharts.DrillupAllCallbackFunction}
 * @since     4.2.4
 * @product   highcharts highmaps
 * @context   Highcharts.Chart
 * @requires  modules/drilldown
 * @apioption chart.events.drillupall
 */

/**
 * The `id` of a series in the [drilldown.series](#drilldown.series) array to
 * use for a drilldown for this point.
 *
 * @sample {highcharts} highcharts/drilldown/basic/
 *         Basic drilldown
 *
 * @type      {string}
 * @since     3.0.8
 * @product   highcharts
 * @requires  modules/drilldown
 * @apioption series.line.data.drilldown
 */

/**
 * A general fadeIn method.
 *
 * @requires module:modules/drilldown
 *
 * @function Highcharts.SVGElement#fadeIn
 *
 * @param {boolean|Partial<Highcharts.AnimationOptionsObject>} [animation]
 * The animation options for the element fade.
 */
SVGRenderer.prototype.Element.prototype.fadeIn = function (
    animation?: (boolean|Partial<AnimationOptions>)
): void {
    this
        .attr({
            opacity: 0.1,
            visibility: 'inherit'
        })
        .animate({
            opacity: pick(this.newOpacity, 1) // newOpacity used in maps
        }, animation || {
            duration: 250
        });
};

/**
 * Add a series to the chart as drilldown from a specific point in the parent
 * series. This method is used for async drilldown, when clicking a point in a
 * series should result in loading and displaying a more high-resolution series.
 * When not async, the setup is simpler using the
 * [drilldown.series](https://api.highcharts.com/highcharts/drilldown.series)
 * options structure.
 *
 * @sample highcharts/drilldown/async/
 *         Async drilldown
 *
 * @function Highcharts.Chart#addSeriesAsDrilldown
 *
 * @param {Highcharts.Point} point
 * The point from which the drilldown will start.
 *
 * @param {Highcharts.SeriesOptionsType} options
 * The series options for the new, detailed series.
 */
Chart.prototype.addSeriesAsDrilldown = function (
    point: Point,
    options: SeriesTypeOptions
): void {
    this.addSingleSeriesAsDrilldown(point, options);
    this.applyDrilldown();
};
Chart.prototype.addSingleSeriesAsDrilldown = function (
    point: Point,
    ddOptions: SeriesTypeOptions
): void {
    let oldSeries = point.series,
        xAxis = oldSeries.xAxis,
        yAxis = oldSeries.yAxis,
        newSeries: Series,
        pointIndex: number,
        levelSeries: Array<Series> = [],
        levelSeriesOptions: Array<SeriesOptions> = [],
        level: (Highcharts.DrilldownLevelObject),
        levelNumber: number,
        last: (Highcharts.DrilldownLevelObject|undefined),
        colorProp: SeriesOptions;


    colorProp = this.styledMode ?
        { colorIndex: pick(point.colorIndex, oldSeries.colorIndex) } :
        { color: point.color || oldSeries.color };

    if (!this.drilldownLevels) {
        this.drilldownLevels = [];
    }

    levelNumber = oldSeries.options._levelNumber || 0;

    // See if we can reuse the registered series from last run
    last = this.drilldownLevels[this.drilldownLevels.length - 1];
    if (last && last.levelNumber !== levelNumber) {
        last = void 0;
    }

    ddOptions = extend(extend<SeriesOptions>({
        _ddSeriesId: ddSeriesId++
    }, colorProp), ddOptions);
    pointIndex = oldSeries.points.indexOf(point);

    // Record options for all current series
    oldSeries.chart.series.forEach(function (series: Series): void {
        if (series.xAxis === xAxis && !series.isDrilling) {
            series.options._ddSeriesId =
                series.options._ddSeriesId || ddSeriesId++;
            series.options._colorIndex = series.userOptions._colorIndex;
            series.options._levelNumber =
                series.options._levelNumber || levelNumber; // #3182

            if (last) {
                levelSeries = last.levelSeries;
                levelSeriesOptions = last.levelSeriesOptions;
            } else {
                levelSeries.push(series);

                // (#10597)
                series.purgedOptions = merge<SeriesTypeOptions>({
                    _ddSeriesId: series.options._ddSeriesId,
                    _levelNumber: series.options._levelNumber,
                    selected: series.options.selected
                }, series.userOptions);

                levelSeriesOptions.push(series.purgedOptions);
            }
        }
    });

    // Add a record of properties for each drilldown level
    level = extend<Highcharts.DrilldownLevelObject>({
        levelNumber: levelNumber,
        seriesOptions: oldSeries.options,
        seriesPurgedOptions: oldSeries.purgedOptions as any,
        levelSeriesOptions: levelSeriesOptions,
        levelSeries: levelSeries,
        shapeArgs: point.shapeArgs,
        // no graphic in line series with markers disabled
        bBox: point.graphic ? point.graphic.getBBox() : {},
        color: point.isNull ?
            Color.parse(colorProp.color).setOpacity(0).get() :
            colorProp.color,
        lowerSeriesOptions: ddOptions,
        pointOptions: (oldSeries.options.data as any)[pointIndex],
        pointIndex: pointIndex,
        oldExtremes: {
            xMin: xAxis && xAxis.userMin,
            xMax: xAxis && xAxis.userMax,
            yMin: yAxis && yAxis.userMin,
            yMax: yAxis && yAxis.userMax
        },
        resetZoomButton: this.resetZoomButton as any
    } as any, colorProp);

    // Push it to the lookup array
    this.drilldownLevels.push(level);

    // Reset names to prevent extending (#6704)
    if (xAxis && xAxis.names) {
        xAxis.names.length = 0;
    }

    newSeries = level.lowerSeries = this.addSeries(ddOptions, false);
    newSeries.options._levelNumber = levelNumber + 1;
    if (xAxis) {
        xAxis.oldPos = xAxis.pos;
        xAxis.userMin = xAxis.userMax = null as any;
        yAxis.userMin = yAxis.userMax = null as any;
    }

    // Run fancy cross-animation on supported and equal types
    if (oldSeries.type === newSeries.type) {
        newSeries.animate = (newSeries.animateDrilldown || noop);
        newSeries.options.animation = true;
    }
};

Chart.prototype.applyDrilldown = function (): void {
    let drilldownLevels = this.drilldownLevels,
        levelToRemove: (number|undefined);

    if (drilldownLevels && drilldownLevels.length > 0) { // #3352, async loading
        levelToRemove = drilldownLevels[drilldownLevels.length - 1].levelNumber;
        (this.drilldownLevels as any).forEach(function (
            level: Highcharts.DrilldownLevelObject
        ): void {
            if (level.levelNumber === levelToRemove) {
                level.levelSeries.forEach(function (series): void {
                    // Not removed, not added as part of a multi-series
                    // drilldown
                    if (
                        series.options &&
                        series.options._levelNumber === levelToRemove
                    ) {
                        series.remove(false);
                    }
                });
            }
        });
    }

    // We have a reset zoom button. Hide it and detatch it from the chart. It
    // is preserved to the layer config above.
    if (this.resetZoomButton) {
        this.resetZoomButton.hide();
        delete this.resetZoomButton;
    }

    this.pointer.reset();
    this.redraw();
    this.showDrillUpButton();
    fireEvent(this, 'afterDrilldown');
};

Chart.prototype.getDrilldownBackText = function (): (string|undefined) {
    let drilldownLevels = this.drilldownLevels,
        lastLevel: Highcharts.DrilldownLevelObject;

    if (drilldownLevels && drilldownLevels.length > 0) { // #3352, async loading
        lastLevel = drilldownLevels[drilldownLevels.length - 1];
        (lastLevel as any).series = lastLevel.seriesOptions;
        return format(this.options.lang.drillUpText || '', lastLevel);
    }
};

Chart.prototype.showDrillUpButton = function (): void {
    let chart = this,
        backText = this.getDrilldownBackText(),
        buttonOptions = (chart.options.drilldown as any).drillUpButton,
        attr,
        states,
        alignTo = (
            buttonOptions.relativeTo === 'chart' ||
            buttonOptions.relativeTo === 'spacingBox' ?
                null :
                'scrollablePlotBox'
        );

    if (!this.drillUpButton) {
        attr = buttonOptions.theme;
        states = attr && attr.states;

        this.drillUpButton = this.renderer
            .button(
                backText as any,
                null as any,
                null as any,
                function (): void {
                    chart.drillUp();
                },
                attr,
                states && states.hover,
                states && states.select
            )
            .addClass('highcharts-drillup-button')
            .attr({
                align: buttonOptions.position.align,
                zIndex: 7
            })
            .add()
            .align(buttonOptions.position, false, alignTo as any);
    } else {
        this.drillUpButton.attr({
            text: backText
        })
            .align();
    }
};

/**
 * When the chart is drilled down to a child series, calling `chart.drillUp()`
 * will drill up to the parent series.
 *
 * @requires  modules/drilldown
 *
 * @function Highcharts.Chart#drillUp
 *
 * @sample {highcharts} highcharts/drilldown/programmatic
 *         Programmatic drilldown
 */
Chart.prototype.drillUp = function (): void {
    if (!this.drilldownLevels || this.drilldownLevels.length === 0) {
        return;
    }

    let chart = this,
        drilldownLevels = chart.drilldownLevels as any,
        levelNumber = drilldownLevels[drilldownLevels.length - 1].levelNumber,
        i = drilldownLevels.length,
        chartSeries = chart.series,
        seriesI: number,
        level: Highcharts.DrilldownLevelObject,
        oldSeries: Series,
        newSeries: (Series|undefined),
        oldExtremes: Record<string, (number|undefined)>,
        addSeries = function (seriesOptions: SeriesOptions): void {
            let addedSeries;

            chartSeries.forEach(function (series): void {
                if (series.options._ddSeriesId === seriesOptions._ddSeriesId) {
                    addedSeries = series;
                }
            });

            addedSeries = addedSeries || chart.addSeries(seriesOptions, false);
            if (
                addedSeries.type === oldSeries.type &&
                addedSeries.animateDrillupTo
            ) {
                addedSeries.animate = addedSeries.animateDrillupTo;
            }

            if (seriesOptions === level.seriesPurgedOptions) {
                newSeries = addedSeries;
            }
        };

    while (i--) {

        level = drilldownLevels[i];
        if (level.levelNumber === levelNumber) {
            drilldownLevels.pop();

            // Get the lower series by reference or id
            oldSeries = level.lowerSeries;
            if (!oldSeries.chart) { // #2786
                seriesI = chartSeries.length; // #2919
                while (seriesI--) {
                    if (
                        chartSeries[seriesI].options.id ===
                            level.lowerSeriesOptions.id &&
                        chartSeries[seriesI].options._levelNumber ===
                            levelNumber + 1
                    ) { // #3867
                        oldSeries = chartSeries[seriesI];
                        break;
                    }
                }
            }
            oldSeries.xData = []; // Overcome problems with minRange (#2898)

            level.levelSeriesOptions.forEach(addSeries);

            fireEvent(chart, 'drillup', {
                seriesOptions: level.seriesPurgedOptions ||
                    level.seriesOptions
            });

            this.resetZoomButton && this.resetZoomButton.destroy(); // #8095

            if ((newSeries as any).type === oldSeries.type) {
                (newSeries as any).drilldownLevel = level;
                (newSeries as any).options.animation =
                    (chart.options.drilldown as any).animation;

                if (oldSeries.animateDrillupFrom && oldSeries.chart) { // #2919
                    oldSeries.animateDrillupFrom(level);
                }
            }
            (newSeries as any).options._levelNumber = levelNumber;

            oldSeries.remove(false);

            // Reset the zoom level of the upper series
            if ((newSeries as any).xAxis) {
                oldExtremes = level.oldExtremes;
                (newSeries as any).xAxis.setExtremes(
                    oldExtremes.xMin,
                    oldExtremes.xMax,
                    false
                );
                (newSeries as any).yAxis.setExtremes(
                    oldExtremes.yMin,
                    oldExtremes.yMax,
                    false
                );
            }

            // We have a resetZoomButton tucked away for this level. Attatch
            // it to the chart and show it.
            if (level.resetZoomButton) {
                chart.resetZoomButton = level.resetZoomButton;
                chart.resetZoomButton.show();
            }
        }
    }

    this.redraw();

    if (this.drilldownLevels.length === 0) {
        this.drillUpButton = (this.drillUpButton as any).destroy();
    } else {
        (this.drillUpButton as any).attr({
            text: this.getDrilldownBackText()
        })
            .align();
    }

    (this.ddDupes as any).length = []; // #3315

    // Fire a once-off event after all series have been drilled up (#5158)
    fireEvent(chart, 'drillupall');
};

/* eslint-disable no-invalid-this */

// Add update function to be called internally from Chart.update
// (#7600, #12855)
addEvent(Chart, 'afterInit', function (): void {
    const chart = this;

    chart.drilldown = {
        update: function (
            options: Highcharts.DrilldownOptions,
            redraw?: boolean
        ): void {
            merge(true, chart.options.drilldown, options);
            if (pick(redraw, true)) {
                chart.redraw();
            }
        }
    };
});

// Shift the drillUpButton to make the space for resetZoomButton, #8095.
addEvent(Chart, 'afterShowResetZoom', function (): void {
    const chart = this,
        bbox = chart.resetZoomButton && chart.resetZoomButton.getBBox(),
        buttonOptions = (
            chart.options.drilldown &&
            chart.options.drilldown.drillUpButton
        );

    if (
        this.drillUpButton &&
        bbox &&
        buttonOptions &&
        buttonOptions.position &&
        buttonOptions.position.x
    ) {
        this.drillUpButton.align({
            x: buttonOptions.position.x - bbox.width - 10,
            y: buttonOptions.position.y,
            align: buttonOptions.position.align
        },
        false,
        buttonOptions.relativeTo || 'plotBox'
        );
    }
});

addEvent(Chart, 'render', function (): void {
    (this.xAxis || []).forEach(function (axis): void {
        axis.ddPoints = {};
        axis.series.forEach(function (series): void {
            let i,
                xData = series.xData || [],
                points = series.points,
                p;

            for (i = 0; i < xData.length; i++) {
                p = (series.options.data as any)[i];

                // The `drilldown` property can only be set on an array or an
                // object
                if (typeof p !== 'number') {

                    // Convert array to object (#8008)
                    p = series.pointClass.prototype.optionsToObject
                        .call({ series: series }, p);

                    if (p.drilldown) {
                        if (!(axis.ddPoints as any)[xData[i]]) {
                            (axis.ddPoints as any)[xData[i]] = [];
                        }

                        const index = i - (series.cropStart || 0);

                        (axis.ddPoints as any)[xData[i]].push(
                            (points && index >= 0 && index < points.length) ?
                                points[index] :
                                true
                        );
                    }
                }
            }
        });

        // Add drillability to ticks, and always keep it drillability updated
        // (#3951)
        objectEach(axis.ticks, Tick.prototype.drillable);
    });
});


/**
 * When drilling up, keep the upper series invisible until the lower series has
 * moved into place.
 *
 * @private
 * @function Highcharts.ColumnSeries#animateDrillupTo
 * @param {boolean} [init=false]
 * Whether to initialize animation
 */
ColumnSeries.prototype.animateDrillupTo = function (init?: boolean): void {
    if (!init) {
        const newSeries = this,
            level = newSeries.drilldownLevel;

        // First hide all items before animating in again
        this.points.forEach(function (point: Point): void {
            const dataLabel = point.dataLabel;

            if (point.graphic) { // #3407
                point.graphic.hide();
            }

            if (dataLabel) {
                // The data label is initially hidden, make sure it is not faded
                // in (#6127)
                dataLabel.hidden = dataLabel.attr('visibility') === 'hidden';

                if (!dataLabel.hidden) {
                    dataLabel.hide();
                    if (point.connector) {
                        point.connector.hide();
                    }
                }
            }
        });


        // Do dummy animation on first point to get to complete
        syncTimeout(function (): void {
            if (newSeries.points) { // May be destroyed in the meantime, #3389
                // Unable to drillup with nodes, #13711
                let pointsWithNodes: Array<any> = [];
                newSeries.data.forEach(function (el): void {
                    pointsWithNodes.push(el);
                });
                if (newSeries.nodes) {
                    pointsWithNodes = pointsWithNodes.concat(newSeries.nodes);
                }
                pointsWithNodes.forEach(function (
                    point: Point,
                    i: number
                ): void {
                    // Fade in other points
                    const verb =
                        i === (level && level.pointIndex) ? 'show' : 'fadeIn',
                        inherit = verb === 'show' ? true : void 0,
                        dataLabel = point.dataLabel;


                    if (point.graphic) { // #3407
                        point.graphic[verb](inherit);
                    }

                    if (dataLabel && !dataLabel.hidden) { // #6127
                        dataLabel.fadeIn(); // #7384
                        if (point.connector) {
                            point.connector.fadeIn();
                        }
                    }
                });
            }
        }, Math.max(
            (this.chart.options.drilldown as any).animation.duration - 50, 0
        ));

        // Reset to prototype
        delete this.animate;
    }

};

ColumnSeries.prototype.animateDrilldown = function (init?: boolean): void {
    let series = this,
        chart = this.chart,
        drilldownLevels = chart.drilldownLevels,
        animateFrom: (SVGAttributes|undefined),
        animationOptions =
            animObject((chart.options.drilldown as any).animation),
        xAxis = this.xAxis,
        styledMode = chart.styledMode;

    if (!init) {
        (drilldownLevels as any).forEach(function (
            level: Highcharts.DrilldownLevelObject
        ): void {
            if (
                series.options._ddSeriesId ===
                    level.lowerSeriesOptions._ddSeriesId
            ) {
                animateFrom = level.shapeArgs;
                if (!styledMode) {
                    // Add the point colors to animate from
                    (animateFrom as any).fill = level.color;
                }
            }
        });

        (animateFrom as any).x += pick(xAxis.oldPos, xAxis.pos) - xAxis.pos;

        this.points.forEach(function (point: Point): void {
            const animateTo = point.shapeArgs;

            if (!styledMode) {
                // Add the point colors to animate to
                (animateTo as any).fill = point.color;
            }

            if (point.graphic) {
                point.graphic
                    .attr(animateFrom)
                    .animate(
                        extend(
                            point.shapeArgs,
                            { fill: point.color || series.color }
                        ),
                        animationOptions
                    );
            }
            if (point.dataLabel) {
                point.dataLabel.fadeIn(animationOptions);
            }
        });

        // Reset to prototype
        delete this.animate;
    }

};

/**
 * When drilling up, pull out the individual point graphics from the lower
 * series and animate them into the origin point in the upper series.
 *
 * @private
 * @function Highcharts.ColumnSeries#animateDrillupFrom
 * @param {Highcharts.DrilldownLevelObject} level
 *        Level container
 * @return {void}
 */
ColumnSeries.prototype.animateDrillupFrom = function (
    level: Highcharts.DrilldownLevelObject
): void {
    let animationOptions =
            animObject((this.chart.options.drilldown as any).animation),
        group: (SVGElement|undefined) = this.group,
        // For 3d column series all columns are added to one group
        // so we should not delete the whole group. #5297
        removeGroup = group !== this.chart.columnGroup,
        series = this;

    // Cancel mouse events on the series group (#2787)
    (series.trackerGroups as any).forEach(function (key: string): void {
        if ((series as any)[key]) { // we don't always have dataLabelsGroup
            (series as any)[key].on('mouseover');
        }
    });

    if (removeGroup) {
        delete this.group;
    }

    this.points.forEach(function (point: Point): void {
        const graphic = point.graphic,
            animateTo = level.shapeArgs,
            complete = function (): void {
                (graphic as any).destroy();
                if (group && removeGroup) {
                    group = group.destroy();
                }
            };

        if (graphic && animateTo) {

            delete point.graphic;

            if (!series.chart.styledMode) {
                (animateTo as any).fill = level.color;
            }

            if (animationOptions.duration) {
                graphic.animate(
                    animateTo as any,
                    merge(animationOptions, { complete: complete })
                );
            } else {
                graphic.attr(animateTo);
                complete();
            }
        }
    });
};

if (PieSeries) {
    extend(PieSeries.prototype, {
        animateDrillupTo: ColumnSeries.prototype.animateDrillupTo,
        animateDrillupFrom: ColumnSeries.prototype.animateDrillupFrom,

        animateDrilldown: function (
            this: typeof PieSeries.prototype,
            init?: boolean
        ): void {
            const level: Highcharts.DrilldownLevelObject =
                (this.chart.drilldownLevels as any)[
                    (this.chart.drilldownLevels as any).length - 1
                ],
                animationOptions =
                    (this.chart.options.drilldown as any).animation;

            if (this.is('item')) {
                animationOptions.duration = 0;
            }
            // Unable to drill down in the horizontal item series #13372
            if (this.center) {
                const animateFrom = level.shapeArgs,
                    start = (animateFrom as any).start,
                    angle = (animateFrom as any).end - start,
                    startAngle = angle / this.points.length,
                    styledMode = this.chart.styledMode;

                if (!init) {
                    this.points.forEach(function (point, i): void {
                        const animateTo = point.shapeArgs;

                        if (!styledMode) {
                            (animateFrom as any).fill = level.color;
                            (animateTo as any).fill = point.color;
                        }

                        if (point.graphic) {
                            point.graphic
                                .attr(merge(animateFrom, {
                                    start: start + i * startAngle,
                                    end: start + (i + 1) * startAngle
                                }))[animationOptions ? 'animate' : 'attr'](
                                    (animateTo as any),
                                    animationOptions
                                );
                        }
                    });

                    // Reset to prototype
                    delete this.animate;
                }
            }
        }
    });
}

/**
 * Perform drilldown on a point instance. The [drilldown](https://api.highcharts.com/highcharts/series.line.data.drilldown)
 * property must be set on the point options.
 *
 * To drill down multiple points in the same category, use
 * `Axis.drilldownCategory` instead.
 *
 * @requires  modules/drilldown
 *
 * @function Highcharts.Point#doDrilldown
 *
 * @sample {highcharts} highcharts/drilldown/programmatic
 *         Programmatic drilldown
 */
Point.prototype.doDrilldown = function (): void {
    this.runDrilldown();
};

Point.prototype.runDrilldown = function (
    holdRedraw: (boolean|undefined),
    category: (number|undefined),
    originalEvent: Event|undefined
): void {

    const series = this.series,
        chart = series.chart,
        drilldown = chart.options.drilldown;

    let i: number = ((drilldown as any).series || []).length,
        seriesOptions: (SeriesOptions|undefined);

    if (!chart.ddDupes) {
        chart.ddDupes = [];
    }

    while (i-- && !seriesOptions) {
        if (
            (drilldown as any).series[i].id === this.drilldown &&
            chart.ddDupes.indexOf(this.drilldown as any) === -1
        ) {
            seriesOptions = (drilldown as any).series[i];
            chart.ddDupes.push(this.drilldown as any);
        }
    }

    // Fire the event. If seriesOptions is undefined, the implementer can check
    // for  seriesOptions, and call addSeriesAsDrilldown async if necessary.
    fireEvent(chart, 'drilldown', {
        point: this,
        seriesOptions: seriesOptions,
        category: category,
        originalEvent: originalEvent,
        points: (
            typeof category !== 'undefined' &&
            this.series.xAxis.getDDPoints(category).slice(0)
        )
    } as Highcharts.DrilldownEventObject, function (
        e: Highcharts.DrilldownEventObject
    ): void {
        const chart = e.point.series && e.point.series.chart,
            seriesOptions = e.seriesOptions;

        if (chart && seriesOptions) {
            if (holdRedraw) {
                chart.addSingleSeriesAsDrilldown(e.point, seriesOptions);
            } else {
                chart.addSeriesAsDrilldown(e.point, seriesOptions);
            }
        }
    });
};

/**
 * Drill down to a given category. This is the same as clicking on an axis
 * label. If multiple series with drilldown are present, all will drill down to
 * the given category.
 *
 * See also `Point.doDrilldown` for drilling down on a single point instance.
 *
 * @function Highcharts.Axis#drilldownCategory
 *
 * @sample {highcharts} highcharts/drilldown/programmatic
 *         Programmatic drilldown
 *
 * @param {number} x
 *        The index of the category
 * @param {global.MouseEvent} [originalEvent]
 *        The original event, used internally.
 */
Axis.prototype.drilldownCategory = function (
    x: number,
    originalEvent?: MouseEvent
): void {
    this.getDDPoints(x).forEach(function (point): void {
        if (
            point &&
            point.series &&
            point.series.visible &&
            point.runDrilldown
        ) { // #3197
            point.runDrilldown(true, x, originalEvent);
        }
    });
    this.chart.applyDrilldown();
};

/**
 * Return drillable points for this specific X value.
 *
 * @private
 * @function Highcharts.Axis#getDDPoints
 * @param {number} x
 *        Tick position
 * @return {Array<(false|Highcharts.Point)>}
 *         Drillable points
 */
Axis.prototype.getDDPoints = function (
    x: number
): Array<(false|Point)> {
    return (this.ddPoints && this.ddPoints[x] || []);
};


/**
 * Make a tick label drillable, or remove drilling on update.
 *
 * @private
 * @function Highcharts.Axis#drillable
 */
Tick.prototype.drillable = function (): void {
    const pos = this.pos,
        label = this.label,
        axis = this.axis,
        isDrillable = axis.coll === 'xAxis' && axis.getDDPoints,
        ddPointsX = isDrillable && axis.getDDPoints(pos),
        styledMode = axis.chart.styledMode;

    if (isDrillable) {
        if (label && ddPointsX && ddPointsX.length) {
            label.drillable = true;

            if (!label.basicStyles && !styledMode) {
                label.basicStyles = merge(label.styles);
            }

            label.addClass('highcharts-drilldown-axis-label');

            // #12656 - avoid duplicate of attach event
            if (label.removeOnDrillableClick) {
                removeEvent(label.element, 'click');
            }

            label.removeOnDrillableClick = addEvent(
                label.element,
                'click',
                function (e: MouseEvent): void {
                    e.preventDefault();
                    axis.drilldownCategory(pos, e);
                }
            );

            if (!styledMode) {
                label.css(
                    (axis.chart.options.drilldown as any).activeAxisLabelStyle
                );
            }

        } else if (label && label.drillable && label.removeOnDrillableClick) {


            if (!styledMode) {
                label.styles = {}; // reset for full overwrite of styles
                label.css(label.basicStyles);
            }

            label.removeOnDrillableClick(); // #3806
            label.removeClass('highcharts-drilldown-axis-label');
        }
    }
};


// On initialization of each point, identify its label and make it clickable.
// Also, provide a list of points associated to that label.
addEvent(Point, 'afterInit', function (): Point {
    const point = this;

    if (point.drilldown && !point.unbindDrilldownClick) {
        // Add the click event to the point
        point.unbindDrilldownClick = addEvent(point, 'click', handlePointClick);
    }

    return point;
});

addEvent(Point, 'update', function (e: { options: Options }): void {
    const point = this,
        options = e.options || {};

    if (options.drilldown && !point.unbindDrilldownClick) {
        // Add the click event to the point
        point.unbindDrilldownClick = addEvent(point, 'click', handlePointClick);
    } else if (
        !options.drilldown &&
        options.drilldown !== void 0 &&
        point.unbindDrilldownClick
    ) {
        point.unbindDrilldownClick = point.unbindDrilldownClick();
    }
});

const handlePointClick = function (
    this: Point,
    e: MouseEvent
): void {
    const point = this,
        series = point.series;

    if (
        series.xAxis &&
        (series.chart.options.drilldown as any).allowPointDrilldown ===
        false
    ) {
        // #5822, x changed
        series.xAxis.drilldownCategory(point.x as any, e);
    } else {
        point.runDrilldown(void 0, void 0, e);
    }
};

addEvent(Series, 'afterDrawDataLabels', function (): void {
    const css = (this.chart.options.drilldown as any).activeDataLabelStyle,
        renderer = this.chart.renderer,
        styledMode = this.chart.styledMode;

    this.points.forEach(function (point: Point): void {
        const dataLabelsOptions = point.options.dataLabels,
            pointCSS = pick(
                point.dlOptions as any,
                dataLabelsOptions && (dataLabelsOptions as any).style,
                {}
            ) as CSSObject;

        if (point.drilldown && point.dataLabel) {

            if (css.color === 'contrast' && !styledMode) {
                pointCSS.color = renderer.getContrast(
                    (point.color as any) || (this.color as any)
                );
            }

            if (dataLabelsOptions && (dataLabelsOptions as any).color) {
                pointCSS.color = (dataLabelsOptions as any).color;
            }
            point.dataLabel
                .addClass('highcharts-drilldown-data-label');

            if (!styledMode) {
                point.dataLabel
                    .css(css)
                    .css(pointCSS);
            }
        }
    }, this);
});


const applyCursorCSS = function (
    element: SVGElement,
    cursor: CursorValue,
    addClass?: boolean,
    styledMode?: boolean
): void {
    element[addClass ? 'addClass' : 'removeClass'](
        'highcharts-drilldown-point'
    );

    if (!styledMode) {
        element.css({ cursor: cursor });
    }
};

// Mark the trackers with a pointer
addEvent(Series, 'afterDrawTracker', function (): void {
    const styledMode = this.chart.styledMode;

    this.points.forEach(function (point): void {
        if (point.drilldown && point.graphic) {
            applyCursorCSS(point.graphic, 'pointer', true, styledMode);
        }
    });
});

addEvent(Point, 'afterSetState', function (): void {
    const styledMode = this.series.chart.styledMode;

    if (this.drilldown && this.series.halo && this.state === 'hover') {
        applyCursorCSS(this.series.halo, 'pointer', true, styledMode);
    } else if (this.series.halo) {
        applyCursorCSS(this.series.halo, 'auto', false, styledMode);
    }
});

// After zooming out, shift the drillUpButton to the previous position, #8095.
addEvent(Chart, 'selection', function (event: any): void {
    if (event.resetSelection === true && this.drillUpButton) {
        const buttonOptions = (
            this.options.drilldown && this.options.drilldown.drillUpButton
        );

        if (buttonOptions && buttonOptions.position) {
            this.drillUpButton.align({
                x: buttonOptions.position.x,
                y: buttonOptions.position.y,
                align: buttonOptions.position.align
            },
            false,
            buttonOptions.relativeTo || 'plotBox'
            );
        }
    }
});

addEvent(Chart, 'drillup', function (): void {
    if (this.resetZoomButton) {
        this.resetZoomButton = this.resetZoomButton.destroy();
    }
});
