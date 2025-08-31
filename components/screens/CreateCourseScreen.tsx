import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ArrowLeft, BookOpen, UploadCloud, FileText, CheckCircle, AlertCircle, XCircle, Video, DollarSign } from 'lucide-react';

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const CreateCourseScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Masterclass'>('Beginner');
    const [price, setPrice] = useState('0');
    const [uploadFiles, setUploadFiles] = useState<FileUploadStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            // FIX: Explicitly type `file` as `File` to resolve type inference issue.
            const newFiles: FileUploadStatus[] = Array.from(selectedFiles).map((file: File) => ({
                file,
                status: 'pending',
                progress: 0,
            }));
            setUploadFiles(prev => [...prev, ...newFiles]);
        }
    };
    
    const removeFile = (fileName: string) => {
        setUploadFiles(prev => prev.filter(f => f.file.name !== fileName));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !currentUser) {
            setError('Please fill in all required fields.');
            return;
        }
        if (uploadFiles.length > 5) {
            setError('You can upload a maximum of 5 files.');
            return;
        }
        setError('');
        setIsUploading(true);

        try {
            const materialUploadPromises = uploadFiles.map((uploadFile, index) => {
                return new Promise((resolve, reject) => {
                    const { file } = uploadFile;
                    const storageRef = ref(storage, `courses/${currentUser.id}/${Date.now()}_${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                             setUploadFiles(prev => {
                                const newFiles = [...prev];
                                newFiles[index] = { ...newFiles[index], status: 'uploading', progress };
                                return newFiles;
                            });
                        },
                        (error) => {
                            const errorMessage = `Upload failed.`;
                            setUploadFiles(prev => {
                                const newFiles = [...prev];
                                newFiles[index] = { ...newFiles[index], status: 'error', error: errorMessage };
                                return newFiles;
                            });
                            reject(new Error(`Failed to upload ${file.name}`));
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                             setUploadFiles(prev => {
                                const newFiles = [...prev];
                                newFiles[index] = { ...newFiles[index], status: 'success', progress: 100 };
                                return newFiles;
                            });
                            const fileType = file.type.startsWith('video/') ? 'video' : 'pdf';
                            resolve({ name: file.name, url: downloadURL, type: fileType });
                        }
                    );
                });
            });

            const materials = await Promise.all(materialUploadPromises);

            await addDoc(collection(db, 'courses'), {
                title,
                description,
                level,
                price: parseFloat(price) || 0,
                coachId: currentUser.id,
                materials,
                createdAt: serverTimestamp(),
                thumbnailUrl: `https://picsum.photos/seed/${title.replace(/\s/g, '-')}/400/225`,
            });
            
            navigate('/explore');

        } catch (err: any) {
            setError('Failed to create course. One or more file uploads failed. Please check and try again.');
        } finally {
            setIsUploading(false);
        }
    };
    
    const renderFileStatus = (file: FileUploadStatus) => {
        switch(file.status) {
            case 'uploading':
                return (
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: `${file.progress.toFixed(0)}%`}}></div>
                    </div>
                );
            case 'success':
                return <CheckCircle size={24} className="text-soft-emerald" />;
            case 'error':
                 return <div className="flex items-center gap-1 text-accent" title={file.error}>
                     <AlertCircle size={24} /> <span>Error</span>
                 </div>;
            case 'pending':
            default:
                return (
                     <button type="button" onClick={() => removeFile(file.file.name)} className="text-gray-400 hover:text-accent">
                        <XCircle size={24} />
                    </button>
                );
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-text-charcoal mb-6">Create New Course</h1>
            
            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
                    
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
                    </div>

                    <div>
                        <label htmlFor="level" className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                        <div className="relative">
                           <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                           <select id="level" value={level} onChange={e => setLevel(e.target.value as any)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg appearance-none focus:ring-primary focus:border-primary">
                               <option>Beginner</option>
                               <option>Intermediate</option>
                               <option>Advanced</option>
                               <option>Masterclass</option>
                           </select>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Price (USD)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                            <input 
                                type="number" 
                                id="price" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                required 
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="e.g., 29.99"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        {parseFloat(price) === 0 && <p className="text-sm text-gray-500 mt-1">Set price to 0 for a free course.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Upload Materials (PDF or Video)</label>
                        <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${isUploading ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}`}>
                            <UploadCloud className="mx-auto text-gray-400" size={40} />
                            <p className="mt-2 text-gray-600">Click to browse or drag and drop files here</p>
                            <p className="text-xs text-gray-500 mt-1">Maximum 5 files, PDF or Video formats</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".pdf,video/*" className="hidden" disabled={isUploading}/>
                        </div>
                        {uploadFiles.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {uploadFiles.map((uploadStatus, i) => {
                                   const isVideo = uploadStatus.file.type.startsWith('video/');
                                   return (
                                       <div key={i} className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                               {isVideo ? <Video size={24} className="text-primary flex-shrink-0"/> : <FileText size={24} className="text-primary flex-shrink-0"/>}
                                               <span className="text-sm font-medium truncate" title={uploadStatus.file.name}>{uploadStatus.file.name}</span>
                                            </div>
                                           <div className="flex-shrink-0">
                                                {renderFileStatus(uploadStatus)}
                                           </div>
                                       </div>
                                   );
                                })}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? 'Creating Course...' : 'Create Course'}
                    </button>
                </form>
            </Card>
        </div>
    );
};