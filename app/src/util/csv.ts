import { saveAs } from 'file-saver';

const ROW_SEPARATOR = '\n';
const COL_SEPARATOR = ',';

/**
 * A mapping of object property names to CSV file header names
 * @param key the property name used to pluck a value from each object
 * @param value the header text to display in the first row of this column
 */
export type CsvColumns = Record<string, string>;

export default class CsvExporter {
  /**
   * Exports data to a CSV file and prompts the user to download via the browser
   * @param fileName the file name without the `csv` extension
   * @param columns the columns containing keys to pluck off of each object
   * @param data an array of objects containing the data
   */
  export(fileName: string, columns: CsvColumns, data: any[]) {
    const content = this.convert(columns, data);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${fileName}.csv`);
  }

  /**
   * Converts and array of data objects into a CSV formatted string using
   * the columns mapping to specify which properties to include
   * @param columns the columns containing keys to pluck off of each object
   * @param data an array of objects containing the data
   */
  convert(columns: CsvColumns, data: any[]) {
    // an array of rows in the CSV file
    const rows: string[] = [];

    // add the header row
    rows.push(Object.values(columns).map(this.wrap).join(','));

    // add each row of data
    data.forEach(record => {
      // convert each object of data into an array of the values
      const values = Object.keys(columns).reduce((cols, dataKey) => {
        const value = record[dataKey];
        cols.push(this.wrap(value ? value : ''));
        return cols;
      }, [] as string[]);

      // convert the values to string and add to the content array
      rows.push(values.join(COL_SEPARATOR));
    });

    // convert the rows into a string
    return rows.join(ROW_SEPARATOR);
  }

  /**
   * Wraps a value in double quotes. If the value contains a
   * separator character, it would break the CSV structure
   * @param value the value to wrap
   */
  wrap(value: string) {
    return `"${value}"`;
  }
}
