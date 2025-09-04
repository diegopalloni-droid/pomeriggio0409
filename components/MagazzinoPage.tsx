import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FileUpload } from './FileUpload';
import { useUserFiles } from '../hooks/useUserFiles';
import { FileUploadHistory } from './FileUploadHistory';

export const MagazzinoPage: React.FC = () => {
  const { user } = useAppContext();
  const { files: userFiles, loading } = useUserFiles(user?.uid);

  if (!user) return null;

  const latestFile = userFiles.length > 0 ? { fileName: userFiles[0].fileName } : null;

  return (
    <div className="w-full pt-10">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <FileUpload user={user} userFile={latestFile} role={user.role} />
        {loading ? <p className="text-slate-400 text-center">Loading history...</p> : <FileUploadHistory files={userFiles} />}
      </div>
    </div>
  );
};