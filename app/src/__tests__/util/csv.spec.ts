import { saveAs } from 'file-saver';
import CsvExporter from 'util/csv';
import { loopListSwaps } from 'util/tests/sampleData';
import { Swap } from 'store/models';

describe('csv Util', () => {
  const csv = new CsvExporter();
  const swaps = [new Swap(loopListSwaps.swapsList[0])];

  it('should export using the .csv extension', () => {
    csv.export('swaps', Swap.csvColumns, swaps);
    expect(saveAs).toBeCalledWith(expect.any(Blob), 'swaps.csv');
  });

  it('should convert swap data to the correct string', () => {
    const actual = csv.convert(Swap.csvColumns, swaps);
    const expected = [
      '"Swap ID","Type","Amount","Status","Created On","Updated On"',
      '"f4eb118383c2b09d8c7289ce21c25900cfb4545d46c47ed23a31ad2aa57ce830","Loop Out","500000","Failed","Apr 8, 11:59 PM","Apr 9, 2:12 AM"',
    ].join('\n');
    expect(actual).toEqual(expected);
  });
});
