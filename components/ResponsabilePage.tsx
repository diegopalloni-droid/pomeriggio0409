import React, { useEffect, useState } from 'react';
import { UserRole, ExcelRow, FileMetadata } from '../types';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
// FIX: Remove v9 imports for Firestore
import { db, storage } from '../firebase';
import { parseExcelFromBuffer } from '../services/excelService';
import { UserManagement } from './UserManagement';
import { UserPlusIcon } from './icons/UserPlusIcon';

declare const XLSX: any;

interface AnalysisResult {
  id: string | number;
  magazzinoTot: number;
  forzaVenditaTot: number;
  difference: number;
  [key: string]: any;
}

const calculateAnalysis = (magazzinoFile: { data: ExcelRow[] }, forzaVenditaFiles: { uploaderUsername: string, data: ExcelRow[] }[]): AnalysisResult[] => {
    const maxLength = Math.max(magazzinoFile.data.length, ...forzaVenditaFiles.map(f => f.data.length));
    const results: AnalysisResult[] = [];
    const sortedForzaVenditaFiles = [...forzaVenditaFiles].sort((a, b) => a.uploaderUsername.localeCompare(b.uploaderUsername));

    for (let i = 0; i < maxLength; i++) {
        const magazzinoRow = magazzinoFile.data[i] || {};
        const magazzinoTot = magazzinoRow.tot || 0;

        const individualForzaVenditaTots: { [key: string]: number } = {};
        let forzaVenditaTot = 0;
        
        for (const file of sortedForzaVenditaFiles) {
            const row = file.data[i] || {};
            const tot = row.tot || 0;
            individualForzaVenditaTots[file.uploaderUsername] = tot;
            forzaVenditaTot += tot;
        }

        const otherColumns = { ...magazzinoRow };
        delete otherColumns.tot;
        
        const id = otherColumns.ID || otherColumns.SKU || `Row ${i + 1}`;
        if ('ID' in otherColumns) delete otherColumns.ID;
        if ('SKU' in otherColumns) delete otherColumns.SKU;

        results.push({
            id,
            ...otherColumns,
            magazzinoTot,
            ...individualForzaVenditaTots,
            forzaVenditaTot,
            difference: magazzinoTot - forzaVenditaTot,
        });
    }
    return results;
};

export const ResponsabilePage: React.FC = () => {
    const [analysisData, setAnalysisData] = useState<AnalysisResult[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showUserManagement, setShowUserManagement] = useState(false);
    
    useEffect(() => {
      const fetchAndAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Get latest magazzino file
            const magazzinoQuery = db.collection('files').where('role', '==', UserRole.MAGAZZINO).orderBy('createdAt', 'desc').limit(1);
            const magazzinoSnapshot = await magazzinoQuery.get();
            const magazzinoFileMeta = magazzinoSnapshot.docs[0]?.data() as FileMetadata;

            // Get all forza vendita files
            const fvQuery = db.collection('files').where('role', '==', UserRole.FORZA_VENDITA);
            const fvSnapshot = await fvQuery.get();
            const fvFilesMeta = fvSnapshot.docs.map(doc => doc.data() as FileMetadata);
            
            if (!magazzinoFileMeta || fvFilesMeta.length === 0) {
                setAnalysisData(null);
                return;
            }
            
            // Download all files using the authenticated SDK
            // FIX: The `getBytes()` method does not exist on the Storage Reference for the v8 compat library.
            // The correct approach is to get a fresh download URL using `getDownloadURL()` and then fetch the file content.
            const downloadFile = async (meta: FileMetadata): Promise<ArrayBuffer> => {
              const downloadUrl = meta.storagePath
                ? await storage.ref(meta.storagePath).getDownloadURL()
                : meta.downloadURL;

              const res = await fetch(downloadUrl);
              if (!res.ok) throw new Error(`Failed to download ${meta.fileName}`);
              return res.arrayBuffer();
            };

            const allFilesMeta = [magazzinoFileMeta, ...fvFilesMeta];
            const fileBuffers = await Promise.all(allFilesMeta.map(downloadFile));
            
            const magazzinoData = parseExcelFromBuffer(fileBuffers[0]);
            const fvData = fileBuffers.slice(1).map((buffer, index) => ({
                uploaderUsername: fvFilesMeta[index].uploaderUsername,
                data: parseExcelFromBuffer(buffer)
            }));
            
            const results = calculateAnalysis({ data: magazzinoData }, fvData);
            setAnalysisData(results);

        } catch (err: any) {
            console.error("Error fetching or analyzing data:", err);
            setError("Failed to fetch or process files for analysis.");
            setAnalysisData(null);
        } finally {
            setIsLoading(false);
        }
      };

      fetchAndAnalyze();
    }, []);

    const handleExport = () => {
        if (!analysisData) return;
        const worksheet = XLSX.utils.json_to_sheet(analysisData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analysis Report');
        XLSX.writeFile(workbook, 'analysis_report.xlsx');
    };

    if (showUserManagement) {
      return <UserManagement onBack={() => setShowUserManagement(false)} />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-bold text-slate-100">Responsabile Dashboard</h2>
                    <div className="flex items-center gap-4">
                         <button onClick={() => setShowUserManagement(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black/20 rounded-lg hover:bg-white/10 transition-colors border border-white/20">
                            <UserPlusIcon className="w-5 h-5" />
                            Manage Users
                        </button>
                        <button onClick={handleExport} disabled={!analysisData || isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-violet-500 rounded-lg hover:shadow-lg hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Export to Excel
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="text-center p-8 bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                    <p className="text-slate-300">Loading and analyzing data from Firebase...</p>
                </div>
            )}

            {!isLoading && error && (
                <div className="text-center p-8 bg-red-900/50 text-red-400 rounded-lg shadow-md border border-red-500/30">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}
            
            {!isLoading && !error && !analysisData && (
                <div className="text-center p-8 bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
                    <h2 className="text-2xl font-bold text-slate-100">Awaiting Files</h2>
                    <p className="mt-2 text-slate-300">The dashboard will be generated once the 'Magazzino' file and at least one 'Forza Vendita' file have been uploaded.</p>
                </div>
            )}

            {!isLoading && !error && analysisData && (
                <div className="bg-slate-900/30 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20">
                    <h3 className="text-lg font-semibold text-slate-100 mb-4">Detailed Analysis</h3>
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-black/20">
                                <tr>
                                    {analysisData.length > 0 && Object.keys(analysisData[0]).map(key => (
                                        <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {analysisData.map((row, index) => (
                                    <tr key={index} className="odd:bg-black/10 even:bg-black/20 hover:bg-white/10 transition-colors">
                                        {Object.entries(row).map(([key, value]) => (
                                            <td key={key} className={`px-6 py-4 whitespace-nowrap text-sm text-slate-300 ${key === 'difference' && typeof value === 'number' && value < 0 ? 'text-red-400 font-bold' : ''}`}>
                                                {typeof value === 'number' ? value.toLocaleString() : String(value ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};