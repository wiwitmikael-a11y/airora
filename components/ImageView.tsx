import React, { useState } from 'react';
import { GeneratedImage, ImageForEditing } from '../types';
import InputBar from './InputBar';
import { ViewType } from '../types';
import { ImageIcon as PlaceholderIcon, EditIcon, GridIcon, BookOpenIcon, AlertTriangleIcon } from './icons/Icons';
import { EMPTY_GALLERY_MESSAGES } from '../constants';
import ImageModal from './ImageModal';
import ImageEditModal from './ImageEditModal';
import { playSound } from '../sound';

const getBase64FromImageUrl = async (url: string): Promise<{base64: string, mimeType: string}> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface ImageCardProps {
    image: GeneratedImage;
    onView: (image: GeneratedImage) => void;
    onEdit: (image: GeneratedImage) => void;
    onGenerateVariations: (prompt: string) => void;
    onUseAsStoryPrompt: (image: GeneratedImage) => void;
    onRetry: (prompt: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onView, onEdit, onGenerateVariations, onUseAsStoryPrompt, onRetry }) => {
    if (image.status === 'failed') {
        return (
            <div className="relative aspect-square bg-gray-900/50 rounded-lg overflow-hidden group flex flex-col items-center justify-center text-center p-4">
                <AlertTriangleIcon className="w-10 h-10 text-red-400/80 mb-2"/>
                <p className="text-sm font-semibold text-red-400">Generation Failed</p>
                <button 
                    onClick={() => onRetry(image.prompt)}
                    className="mt-3 px-3 py-1 text-xs bg-gray-700/80 hover:bg-gray-600/80 rounded-full transition-colors"
                >
                    Retry
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {image.prompt}
                </div>
            </div>
        );
    }
    
    if (image.status === 'processing') {
        return (
            <div className="relative aspect-square bg-gray-900/50 rounded-lg overflow-hidden group flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dashed border-gray-600 rounded-full animate-spin"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {image.prompt}
                </div>
            </div>
        );
    }

    return (
        <div className="relative aspect-square bg-gray-900/50 rounded-lg overflow-hidden group">
            <button onClick={() => onView(image)} onMouseEnter={() => playSound('hover')} className="w-full h-full">
                <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
            </button>
             <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEdit(image)}
                    onMouseEnter={() => playSound('hover')}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-teal-500/50 transition-colors"
                    aria-label="Edit image"
                > <EditIcon className="w-5 h-5"/> </button>
                 <button 
                    onClick={() => onGenerateVariations(image.prompt)}
                    onMouseEnter={() => playSound('hover')}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-blue-500/50 transition-colors"
                    aria-label="Generate variations"
                > <GridIcon className="w-5 h-5"/> </button>
                <button 
                    onClick={() => onUseAsStoryPrompt(image)}
                    onMouseEnter={() => playSound('hover')}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-purple-500/50 transition-colors"
                    aria-label="Use as story prompt"
                > <BookOpenIcon className="w-5 h-5"/> </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {image.prompt}
            </div>
        </div>
    );
};


interface ImageViewProps {
    images: GeneratedImage[];
    isProcessing: boolean;
    onSendMessage: (prompt: string) => void;
    onEditImage: (imageToEdit: ImageForEditing, prompt: string) => void;
    isAnimatingOut: boolean;
    onGenerateVariations: (prompt: string) => void;
    onUseAsStoryPrompt: (image: GeneratedImage) => void;
    onUseImageForVideo: (image: GeneratedImage) => void;
}

const ImageView: React.FC<ImageViewProps> = ({ images, isProcessing, onSendMessage, onEditImage, isAnimatingOut, onGenerateVariations, onUseAsStoryPrompt, onUseImageForVideo }) => {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [imageToEdit, setImageToEdit] = useState<ImageForEditing | null>(null);

    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';

    const handleEditClick = async (image: GeneratedImage) => {
        if (!image.imageUrl) return;
        playSound('click');
        try {
            const { base64, mimeType } = await getBase64FromImageUrl(image.imageUrl);
            setImageToEdit({ ...image, imageUrl: image.imageUrl, base64, mimeType });
        } catch (error) {
            console.error("Error preparing image for editing:", error);
        }
    };

    const handleEditFromModal = (image: GeneratedImage) => {
        setSelectedImage(null); // Close the view modal
        // A short delay to allow the first modal to close before opening the new one
        setTimeout(() => handleEditClick(image), 100);
    };
    
    const handleVariationsClick = (prompt: string) => {
        playSound('click');
        onGenerateVariations(prompt);
    };

    const handleStoryPromptClick = (image: GeneratedImage) => {
        playSound('click');
        onUseAsStoryPrompt(image);
    };


    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {images.length === 0 && !isProcessing && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <PlaceholderIcon className="w-24 h-24 mb-4" />
                        <p>{EMPTY_GALLERY_MESSAGES[ViewType.IMAGE]}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                       <ImageCard 
                           key={image.id}
                           image={image}
                           onView={(img) => { playSound('click'); setSelectedImage(img); }}
                           onEdit={handleEditClick}
                           onGenerateVariations={handleVariationsClick}
                           onUseAsStoryPrompt={handleStoryPromptClick}
                           onRetry={onSendMessage}
                       />
                    ))}
                </div>
            </div>
            <div className="mt-4 flex-shrink-0">
                <InputBar onSendMessage={onSendMessage} isProcessing={isProcessing} mode={ViewType.IMAGE} />
                <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2 px-2">
                    AIRORA dapat menampilkan informasi yang tidak akurat. Aplikasi ini dirancang hanya untuk tujuan edukasi dan eksperimental.
                </p>
            </div>
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onGenerateVariations={onGenerateVariations}
                    onUseAsStoryPrompt={onUseAsStoryPrompt}
                    onEditFromModal={handleEditFromModal}
                    onUseImageForVideo={onUseImageForVideo}
                />
            )}
            {imageToEdit && (
                <ImageEditModal image={imageToEdit} onClose={() => setImageToEdit(null)} onEdit={onEditImage} isProcessing={isProcessing} />
            )}
        </div>
    );
};

export default ImageView;