import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DateTime } from 'luxon';

@Injectable()
export class ExcelService {
  async generateExcel(
    worksheetName: string,
    columns: Partial<ExcelJS.Column>[],
    data: Array<any>,
    timezone: string,
  ): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);
    worksheet.columns = columns;
    worksheet.addRows(data);

    const timeColumn = columns.find((col) => col.key === '_start');
    if (timeColumn) {
      worksheet.getColumn('_start').eachCell({ includeEmpty: true }, (cell) => {
        const dateValue = new Date(cell.value as string);

        if (!isNaN(dateValue.getTime())) {
          const z = DateTime.fromISO(cell.value as string, {
            zone: 'utc',
          })
            .setZone(timezone)
            .toFormat(`yyyy-MM-dd HH:mm:ss '${timezone}'`);

          cell.value = z;
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
