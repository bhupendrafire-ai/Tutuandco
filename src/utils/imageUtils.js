/**
 * Image Utilities for Tutu & Co
 * Handles client-side image processing, specifically HEIC to JPEG conversion
 * for seamless uploads from iPhones.
 */

/**
 * Converts a HEIC file to JPEG if necessary.
 * @param {File} file - The file to check and convert.
 * @returns {Promise<File>} - A promise that resolves to the JPEG File (or the original if not HEIC).
 */
export const convertHeicToJpeg = async (file) => {
    if (!file) return file;

    // Detect HEIC by extension or MIME type
    const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
    
    if (!isHEIC) return file;

    try {
        console.log("📸 HEIC detected. Initializing client-side conversion...");
        
        // Lazy load heic2any for performance/bundling benefits
        const { default: heic2any } = await import('https://esm.sh/heic2any');
        
        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
        });

        // Create a new File object from the blob
        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        return new File(
            [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], 
            newFileName, 
            { type: 'image/jpeg' }
        );
    } catch (err) {
        console.error("❌ HEIC conversion failed:", err);
        // Fallback: Return original file and let the server/Vercel Blob handle/reject it
        // but typically it's better to fail early with a useful message if we're sure it won't work
        throw new Error("Could not process this iPhone photo. Please try converting it to JPEG or PNG first.");
    }
};
