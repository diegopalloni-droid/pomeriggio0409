import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { FileMetadata } from '../types';

export const useUserFiles = (uid: string | undefined) => {
    const [files, setFiles] = useState<FileMetadata[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        const unsubscribe = db.collection('files')
            .where('uploaderUid', '==', uid)
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const userFiles: FileMetadata[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as Omit<FileMetadata, 'id'>,
                }));
                setFiles(userFiles);
                setLoading(false);
            }, error => {
                console.error("Error fetching user files:", error);
                setLoading(false);
            });

        return () => unsubscribe();

    }, [uid]);

    return { files, loading };
};