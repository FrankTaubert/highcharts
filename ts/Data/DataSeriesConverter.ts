/* *
 *
 *  Data Layer
 *
 *  (c) 2012-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
/* *
 *
 *  Imports
 *
 * */
import DataTable from './DataTable.js';
import DataTableRow from './DataTableRow.js';

/* *
 *
 *  Class
 *
 * */
/**
* Class to convert DataTable to Highcharts series data.
*/
class DataSeriesConverter {
    /* *
    *
    *  Constructors
    *
    * */
    public constructor(table: DataTable = new DataTable(), options: DataSeriesConverter.Options) {
        this.table = table;
        this.options = options;
    }
    /* *
    *
    *  Properties
    *
    * */
    public table: DataTable;
    public options: DataSeriesConverter.Options;
    /* *
    *
    *  Functions
    *
    * */
    getSeriesData(columnIndex: number): Array<Highcharts.PointOptionsObject> {
        const table = this.table,
            options = this.options || {},
            dataOptions = [],
            seriesTypeData = this.getSeriesTypeData(options.type || 'line');

        let row,
            column;

        for (let i = 0, iEnd = table.getRowCount(); i < iEnd; i++) {

            row = table.getRow(i);

            if (row) {
                column = row.getColumn(columnIndex);

                if (typeof column === 'number') {
                    dataOptions.push(
                        seriesTypeData(column)
                    );
                }
            }
        }

        return dataOptions;
    }

    getSeriesTypeData(type: string): Function {
        let fcName: Function;

        switch (type) {
        case 'line':
            fcName = this.getLinePoint;
            break;
        case 'pie':
            fcName = this.getPiePoint;
            break;
        case 'range':
            fcName = this.getRangePoint;
            break;
        default:
            fcName = this.getLinePoint;
            break;
        }

        return fcName;
    }

    getLinePoint(column: number): Highcharts.PointOptionsObject {
        return {
            y: column
        };
    }

    getPiePoint(column: number): Highcharts.PointOptionsObject {
        return {
            y: column
        };
    }

    getRangePoint(column: number): Highcharts.PointOptionsObject {
        return {
            y: column
        };
    }

    getAllSeriesData(): Array<Highcharts.SeriesOptions> {
        const table = this.table,
            seriesOptions = [],
            row = table.getRow(0);

        let seriesData;

        if (row) {
            for (let i = 0, iEnd = row.getColumnCount(); i < iEnd; i++) {

                seriesData = this.getSeriesData(i);

                if (seriesData.length > 0) {
                    seriesOptions.push({
                        data: seriesData
                    });
                }
            }
        }

        return seriesOptions;
    }

    setDataTable(allSeries: Array<Highcharts.Series>): DataTable {
        const table = this.table;

        let columns: Record<string, DataTableRow.ColumnTypes>,
            series,
            pointArrayMap,
            valueCount,
            options,
            keys,
            data,
            elem,
            row,
            y,
            xIndex,
            yIndex,
            id;

        for (let i = 0, iEnd = allSeries.length; i < iEnd; i++) {
            series = allSeries[i];
            pointArrayMap = series.pointArrayMap;
            valueCount = pointArrayMap && pointArrayMap.length;
            options = series.options;
            keys = options.keys;
            data = series.options.data || [];

            for (let j = 0, jEnd = data.length; j < jEnd; j++) {
                elem = data[j];
                // temporarily series.name -> change it to eg series.id?
                y = 'y_' + series.name;
                columns = {};

                if (typeof elem === 'number') {
                    columns[y] = elem;
                    columns.x = j;
                } else if (elem instanceof Array) {
                    xIndex = keys ? keys.indexOf('x') : 0;
                    yIndex = keys ? keys.indexOf('y') : 1;
                    columns[y] = elem[yIndex];
                    columns.x = elem[xIndex];
                } else if (elem instanceof Object) {
                    columns[y] = elem.y;
                    columns.x = elem.x || j;
                }

                id = '' + columns.x;
                row = table.getRow(id);

                if (!row) {
                    columns.id = id;
                    row = new DataTableRow(columns);
                    table.insertRow(row);
                } else if (columns[y]) {
                    row.insertColumn(y, columns[y]);
                }
            }
        }

        return table;
    }
}
/* *
 *
 *  Namespace
 *
 * */
namespace DataSeriesConverter {
    export interface Options {
        type?: string;
    }
}
/* *
 *
 *  Export
 *
 * */
export default DataSeriesConverter;