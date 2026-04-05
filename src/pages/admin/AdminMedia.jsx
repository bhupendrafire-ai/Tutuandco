import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { useShop, FINAL_API_URL } from '../../context/ShopContext';

const AdminMedia = () => {
    const { uploadMedia } = useShop();
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        let file = e.target.files[0];
        if (!file) return;

        try {
            // Support HEIC (iPhone) photos by converting them on the fly
            const { convertHeicToJpeg } = await import('../../utils/imageUtils');
            file = await convertHeicToJpeg(file);

            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `${FINAL_API_URL}/api/upload`,
                clientPayload: sessionStorage.getItem('adminToken') || '', // Pass auth token for server verification
            });
            
            await uploadMedia(newBlob.url, file.name);
            alert("Identity uploaded to Vercel Cloud!");
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}.`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-12 rounded-sm shadow-sm border border-[#CD664D]/10">
                <div 
                    className="border-2 border-dashed border-[#CD664D]/20 rounded-sm p-12 text-center cursor-pointer hover:bg-brand-cream/10 transition-all" 
                    onClick={() => fileInputRef.current.click()}
                >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                    <Upload className="mx-auto mb-4 text-[#CD664D]" size={48} />
                    <h3 className="text-xl font-medium">Upload new identity asset</h3>
                    <p className="text-sm text-brand-charcoal/40 mt-2 font-bold uppercase tracking-widest">Supports JPEG, PNG, HEIC (iPhone) • Direct Cloud Sync</p>
                </div>
            </div>
        </div>
    );
};

export default AdminMedia;
