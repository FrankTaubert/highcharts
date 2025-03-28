/* *
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type ControllableCircle from '../Controllables/ControllableCircle';
import type ControllableEllipse from '../Controllables/ControllableEllipse';
import type ControllableRect from '../Controllables/ControllableRect';
import type MockPointOptions from '../MockPointOptions';
import type PointerEvent from '../../../Core/PointerEvent';
import type PositionObject from '../../../Core/Renderer/PositionObject';
import Annotation from '../Annotations.js';
import MockPoint from '../MockPoint.js';
import U from '../../../Core/Utilities.js';

const {
    merge
} = U;

/* eslint-disable no-invalid-this */

class BasicAnnotation extends Annotation {

    /* *
     *
     *  Static Properties
     *
     * */

    public static basicControlPoints: BasicAnnotation.ControlPoints = {
        label: [{
            symbol: 'triangle-down',
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: Highcharts.AnnotationControllable
            ): PositionObject {
                if (!target.graphic.placed) {
                    return {
                        x: 0,
                        y: -9e7
                    };
                }
                const xy = MockPoint
                    .pointToPixels(target.points[0]);
                return {
                    x: xy.x - this.graphic.width / 2,
                    y: xy.y - this.graphic.height / 2
                };
            },
            // TRANSLATE POINT/ANCHOR
            events: {
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: Annotation
                ): void {
                    const xy = this.mouseMoveToTranslation(e);

                    (target.translatePoint as any)(xy.x, xy.y);

                    target.annotation.userOptions.labels[0].point =
                        target.options.point;
                    target.redraw(false);
                }
            }
        }, {
            symbol: 'square',
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: Highcharts.AnnotationControllable
            ): PositionObject {
                if (!target.graphic.placed) {
                    return {
                        x: 0,
                        y: -9e7
                    };
                }
                return {
                    x: target.graphic.alignAttr.x -
                        this.graphic.width / 2,
                    y: target.graphic.alignAttr.y -
                        this.graphic.height / 2
                };
            },
            // TRANSLATE POSITION WITHOUT CHANGING THE
            // ANCHOR
            events: {
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: Highcharts.AnnotationControllable
                ): void {
                    const xy = this.mouseMoveToTranslation(e);
                    target.translate(xy.x, xy.y);

                    target.annotation.userOptions.labels[0].point =
                        target.options.point;

                    target.redraw(false);
                }
            }
        }],

        rectangle: [{
            positioner: function (annotation: Annotation): PositionObject {
                const xy = MockPoint
                    .pointToPixels(annotation.points[2]);
                return {
                    x: xy.x - 4,
                    y: xy.y - 4
                };
            },
            events: {
                drag: function (
                    this: Annotation,
                    e: PointerEvent,
                    target: ControllableRect
                ): void {
                    const annotation = target.annotation,
                        coords = this.chart.pointer.getCoordinates(e),
                        x = coords.xAxis[0].value,
                        y = coords.yAxis[0].value,
                        points: Array<MockPointOptions> = target.options.points as any;

                    // Top right point
                    points[1].x = x;
                    // Bottom right point (cursor position)
                    points[2].x = x;
                    points[2].y = y;
                    // Bottom left
                    points[3].y = y;

                    annotation.userOptions.shapes[0].points =
                        target.options.points;
                    annotation.redraw(false);
                }
            }
        }],

        circle: [{
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: Highcharts.AnnotationControllable
            ): PositionObject {
                const xy = MockPoint.pointToPixels(target.points[0]),
                    r: number = target.options.r as any;
                return {
                    x: xy.x + r * Math.cos(Math.PI / 4) -
                    this.graphic.width / 2,
                    y: xy.y + r * Math.sin(Math.PI / 4) -
                    this.graphic.height / 2
                };
            },
            events: {
            // TRANSFORM RADIUS ACCORDING TO Y
            // TRANSLATION
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: ControllableCircle
                ): void {
                    const annotation = target.annotation,
                        position = this.mouseMoveToTranslation(e);

                    target.setRadius(
                        Math.max(
                            target.options.r +
                                position.y /
                                Math.sin(Math.PI / 4),
                            5
                        )
                    );

                    annotation.userOptions.shapes[0].r = target.options.r;
                    annotation.userOptions.shapes[0].point =
                        target.options.point;

                    target.redraw(false);
                }
            }
        }],
        ellipse: [{
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: ControllableEllipse
            ): PositionObject {
                const position = target.getAbsolutePosition(target.points[0]);

                return {
                    x: position.x - this.graphic.width / 2,
                    y: position.y - this.graphic.height / 2
                };
            },
            events: {
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: ControllableEllipse
                ): void {
                    const position =
                        target.getAbsolutePosition(target.points[0]);

                    target.translatePoint(
                        e.chartX - position.x,
                        e.chartY - position.y,
                        0
                    );

                    target.redraw(false);
                }
            }
        }, {
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: ControllableEllipse
            ): PositionObject {
                const position = target.getAbsolutePosition(target.points[1]);

                return {
                    x: position.x - this.graphic.width / 2,
                    y: position.y - this.graphic.height / 2
                };
            },
            events: {
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: ControllableEllipse
                ): void {
                    const position = target.getAbsolutePosition(
                        target.points[1]
                    );

                    target.translatePoint(
                        e.chartX - position.x,
                        e.chartY - position.y,
                        1
                    );

                    target.redraw(false);
                }
            }
        }, {
            positioner: function (
                this: Highcharts.AnnotationControlPoint,
                target: ControllableEllipse
            ): PositionObject {
                const position = target.getAbsolutePosition(target.points[0]),
                    position2 = target.getAbsolutePosition(target.points[1]),
                    attrs = target.getAttrs(position, position2);

                return {
                    x: attrs.cx - this.graphic.width / 2 +
                        attrs.ry * Math.sin((attrs.angle * Math.PI) / 180),
                    y: attrs.cy - this.graphic.height / 2 -
                        attrs.ry * Math.cos((attrs.angle * Math.PI) / 180)
                };
            },
            events: {
                drag: function (
                    this: Annotation,
                    e: Highcharts.AnnotationEventObject,
                    target: ControllableEllipse
                ): void {
                    const position = target.getAbsolutePosition(
                            target.points[0]
                        ),
                        position2 = target.getAbsolutePosition(
                            target.points[1]
                        ),
                        newR = target.getDistanceFromLine(
                            position,
                            position2,
                            e.chartX,
                            e.chartY
                        ),
                        yAxis = target.getYAxis(),
                        newRY = Math.abs(
                            yAxis.toValue(0) - yAxis.toValue(newR)
                        );

                    target.setYRadius(newRY);

                    target.redraw(false);
                }
            }
        }]
    };

    /* *
     *
     *  Constructors
     *
     * */

    public constructor(
        chart: Highcharts.AnnotationChart,
        options: Highcharts.AnnotationsOptions
    ) {
        super(chart, options);
    }

    /* *
     *
     *  Functions
     *
     * */

    public addControlPoints(): void {
        const options = this.options,
            controlPoints = BasicAnnotation.basicControlPoints,
            annotationType = this.basicType,
            optionsGroup = options.labels || options.shapes;

        optionsGroup.forEach(function (
            group: Highcharts.AnnotationControllableOptionsObject
        ): void {
            group.controlPoints = (controlPoints as any)[annotationType];
        });
    }

    public init(): void {
        const options = this.options;

        if (options.shapes) {
            delete options.labelOptions;
            if (options.shapes[0].type) {
                this.basicType = options.shapes[0].type;
            } else {
                // Defalut shape would be rectangle.
                this.basicType = 'rectangle';
            }
        } else {
            delete options.shapes;
            this.basicType = 'label';
        }
        Annotation.prototype.init.apply(this, arguments);
    }

}

/**
 * @private
 */
interface BasicAnnotation {
    defaultOptions: Annotation['defaultOptions'];
    basicType: string;
}
namespace BasicAnnotation {
    export interface ControlPoints {
        label: DeepPartial<Highcharts.AnnotationControlPointOptionsObject>[];
        rectangle: DeepPartial<Highcharts.AnnotationControlPointOptionsObject>[];
        ellipse: DeepPartial<Highcharts.AnnotationControlPointOptionsObject>[];
        circle: DeepPartial<Highcharts.AnnotationControlPointOptionsObject>[];
    }
}

BasicAnnotation.prototype.defaultOptions = merge(
    Annotation.prototype.defaultOptions,
    {}
);

/* *
 *
 *  Registry
 *
 * */

Annotation.types.basicAnnotation = BasicAnnotation;
declare module './AnnotationType' {
    interface AnnotationTypeRegistry {
        basicAnnotation: typeof BasicAnnotation;
    }
}

/* *
 *
 *  Default Export
 *
 * */

export default BasicAnnotation;
