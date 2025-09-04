import { ExcelRow } from '../types';

// Dichiarazione per informare TypeScript che XLSX è disponibile globalmente (caricato via CDN)
declare const XLSX: any;

/**
 * Parses an Excel file from an ArrayBuffer into an array of JSON objects.
 * @param buffer The ArrayBuffer containing the Excel file data.
 * @returns An array of ExcelRow objects.
 */
export const parseExcelFromBuffer = (buffer: ArrayBuffer): ExcelRow[] => {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
             // Assicura che anche le righe vuote vengano lette come undefined o null
             defval: null
        });
        return jsonData as ExcelRow[];
    } catch (error) {
        console.error("Failed to parse Excel buffer:", error);
        return [];
    }
};
