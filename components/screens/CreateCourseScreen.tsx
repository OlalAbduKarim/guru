import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ArrowLeft, BookOpen, DollarSign, UploadCloud, FileText, CheckCircle } from 'lucide-react';

export const CreateCourseScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [price, setPrice] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !currentUser) {
            setError('Please fill in all required fields.');
            return;
        }
        if (files && files.length > 5) {
            setError('You can upload a maximum of 5 files.');
            return;
        }
        setError('');
        setIsUploading(true);

        try {
            const materialUploadPromises = Array.from(files || []).map(file => {
                return new Promise((resolve, reject) => {
                    const storageRef = ref(storage, `courses/${currentUser.id}/${Date.now()}_${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            reject(`Failed to upload ${file.name}`);
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve({ name: file.name, url: downloadURL });
                        }
                    );
                });
            });

            const materials = await Promise.all(materialUploadPromises);

            await addDoc(collection(db, 'courses'), {
                title,
                description,
                level,
                price: Number(price) || 0,
                coachId: currentUser.id,
                materials,
                createdAt: serverTimestamp(),
                thumbnailUrl: 'https://picsum.photos/seed/newcourse/400/225', // Placeholder thumbnail
            });
            
            navigate('/explore');

        } catch (err: any) {
            setError(err.message || 'Failed to create course. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="level" className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                            <div className="relative">
                               <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                               <select id="level" value={level} onChange={e => setLevel(e.target.value as any)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg appearance-none focus:ring-primary focus:border-primary">
                                   <option>Beginner</option>
                                   <option>Intermediate</option>
                                   <option>Advanced</option>
                               </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-2">Price (USD)</label>
                             <div className="relative">
                               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                               <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="0 for free" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Upload Materials (PDFs)</label>
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5">
                            <UploadCloud className="mx-auto text-gray-400" size={40} />
                            <p className="mt-2 text-gray-600">Click to browse or drag and drop files here</p>
                            <p className="text-xs text-gray-500 mt-1">Maximum 5 files, PDF format</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept=".pdf" className="hidden" />
                        </div>
                        {files && Array.from(files).map((file, i) => (
                           <div key={i} className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <FileText size={20} className="text-primary"/>
                                   <span className="text-sm font-medium">{file.name}</span>
                                </div>
                               {uploadProgress[file.name] === 100 ? (
                                 <CheckCircle size={20} className="text-green-500" />
                               ) : (
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                      <div className="bg-primary h-2.5 rounded-full" style={{width: `${uploadProgress[file.name] || 0}%`}}></div>
                                  </div>
                               )}
                           </div>
                        ))}
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? 'Creating Course...' : 'Create Course'}
                    </button>
                </form>
            </Card>
        </div>
    );
};
