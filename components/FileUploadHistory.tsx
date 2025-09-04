import React from 'react';
import { FileMetadata } from '../types';
// FIX: Use Firebase v9 compat imports to address errors from using v8 syntax with a v9+ SDK.
// FIX: The `firebase/compat/app` module requires a default import to correctly resolve types from services like firestore.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface FileUploadHistoryProps {
    files: FileMetadata[];
}

// Define Timestamp type alias for v8
type Timestamp = firebase.firestore.Timestamp;

const formatTimestamp = (timestamp?: Timestamp): string => {
    if (!timestamp) {
        return 'Just now';
    }
    try {
        return timestamp.toDate().toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'Invalid date';
    }
};

export const FileUploadHistory: React.FC<FileUploadHistoryProps> = ({ files }) => {
    return (
        <div className="w-full max-w-lg mx-auto bg-slate-900/40 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700/80 h-full">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Upload History</h2>
            {files.length === 0 ? (
                <p className="text-center text-slate-400 mt-10">No files uploaded yet.</p>
            ) : (
                <div className="max-h-[28rem] overflow-y-auto pr-2 -mr-2">
                    <ul className="space-y-3">
                        {files.map(file => (
                            <li key={file.id} className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center border border-slate-700 hover:bg-slate-700/50 hover:border-brand-start transition-all duration-200">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-200 truncate" title={file.fileName}>{file.fileName}</p>
                                    <p className="text-xs text-slate-400">{formatTimestamp(file.createdAt)}</p>
                                </div>
                                <a
                                    href={file.downloadURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 p-2 text-slate-400 hover:text-brand-start transition-colors"
                                    aria-label={`Download ${file.fileName}`}
                                    title={`Download ${file.fileName}`}
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};