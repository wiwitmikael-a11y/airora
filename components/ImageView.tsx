import React, { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage, ImageForEditing } from '../types';
import InputBar from './InputBar';
import ImageModal from './ImageModal';
import ImageEditModal from './ImageEditModal';
import { IMAGE_MODEL_ID } from '../constants';
import { DownloadIcon, EditIcon, SparklesIcon } from './icons/Icons';
import { playSound } from '../sound';

interface ImageViewProps {
    isAnimatingOut: boolean;
    getAiInstance: () => GoogleGenAI | null;
}

const ImageView: React.FC<ImageViewProps> = ({ isAnimatingOut, getAiInstance }) => {
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [imageForEditing, setImageForEditing] = useState<ImageForEditing | null>(null);

    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';

    const handleGenerate = useCallback(async (prompt: string) => {
        const ai = getAiInstance();
        if (!ai || !prompt) return;

        setIsLoading(true);
        const newImage: GeneratedImage = {
            id: nanoid(),
            prompt,
            status: 'processing',
        };
        setImages(prev => [newImage, ...prev]);

        try {
            const response = await ai.models.generateImages({
                model: IMAGE_MODEL_ID,
                prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                },
            });
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, imageUrl, status: 'completed' } : img));
        } catch (error) {
            console.error('Error generating image:', error);
            setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, status: 'failed' } : img));
        } finally {
            setIsLoading(false);
        }
    }, [getAiInstance]);
    
    const handleEdit = (image: GeneratedImage) => {
        if (!image.imageUrl) return;
        playSound('click');
        const base64 = image.imageUrl.split(',')[1];
        setImageForEditing({
            id: image.id,
            imageUrl: image.imageUrl,
            prompt: image.prompt,
            base64,
            mimeType: 'image/png'
        });
    };
    
    const handleDownload = (imageUrl: string, prompt: string) => {
        playSound('click');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${prompt.slice(0, 20).replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`w-full h-full flex flex-col glass-glow rounded-3xl ${animationClass}`}>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <SparklesIcon className="w-16 h-16 mb-4 text-teal-400/50" />
                        <h2 className="text-xl font-bold text-white">Image Generation</h2>
                        <p>Describe the image you want to create.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {images.map(image => (
                            <div key={image.id} className="aspect-square rounded-lg bg-gray-800/50 overflow-hidden group relative cursor-pointer" onClick={() => image.imageUrl && setSelectedImage(image)}>
                                {image.status === 'processing' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-8 h-8 border-4 border-t-teal-400 border-gray-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {image.status === 'failed' && (
                                    <div className="w-full h-full flex items-center justify-center text-red-400">Failed</div>
                                )}
                                {image.imageUrl && (
                                    <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                                    <p className="text-sm text-white line-clamp-3">{image.prompt}</p>
                                    {image.status === 'completed' && image.imageUrl && (
                                        <div className="flex items-center gap-2 self-end">
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(image); }} onMouseEnter={() => playSound('hover')} className="p-2 rounded-full bg-black/50 hover:bg-black/70"><EditIcon className="w-4 h-4 text-white" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(image.imageUrl!, image.prompt); }} onMouseEnter={() => playSound('hover')} className="p-2 rounded-full bg-black/50 hover:bg-black/70"><DownloadIcon className="w-4 h-4 text-white" /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="px-6 pb-6">
                <InputBar onSendMessage={handleGenerate} isLoading={isLoading} />
                 <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2">
                    Generations may vary. Be descriptive for best results.
                 </p>
            </div>

            {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
            {imageForEditing && <ImageEditModal image={imageForEditing} onClose={() => setImageForEditing(null)} getAiInstance={getAiInstance} onEditComplete={(newImage) => setImages(prev => [newImage, ...prev])} />}
        </div>
    );
};

export default ImageView;
