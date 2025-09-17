import React, { useState } from 'react';
import { GeneratedImage, ImageForEditing } from '../types';
import InputBar from './InputBar';
import { ViewType } from '../types';
import { ImageIcon as PlaceholderIcon, EditIcon, GridIcon, BookOpenIcon } from './icons/Icons';
import ImageModal from './ImageModal';
import ImageEditModal from './ImageEditModal';

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

interface ImageViewProps {
    images: GeneratedImage[];
    isProcessing: boolean;
    onSendMessage: (prompt: string) => void;
    onEditImage: (imageToEdit: ImageForEditing, prompt: string) => void;
    isAnimatingOut: boolean;
    onGenerateVariations: (prompt: string) => void;
    onUseAsStoryPrompt: (image: GeneratedImage) => void;
}

const ImageView: React.FC<ImageViewProps> = ({ images, isProcessing, onSendMessage, onEditImage, isAnimatingOut, onGenerateVariations, onUseAsStoryPrompt }) => {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const [imageToEdit, setImageToEdit] = useState<ImageForEditing | null>(null);

    const animationClass = isAnimatingOut ? 'animate-fly-out' : 'animate-fly-in';

    const handleEditClick = async (image: GeneratedImage) => {
        try {
            const { base64, mimeType } = await getBase64FromImageUrl(image.imageUrl);
            setImageToEdit({ ...image, base64, mimeType });
        } catch (error) {
            console.error("Error preparing image for editing:", error);
        }
    };

    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {images.length === 0 && !isProcessing && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <PlaceholderIcon className="w-24 h-24 mb-4" />
                        <p>Gambar yang dihasilkan akan muncul di sini.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative aspect-square bg-gray-900/50 rounded-lg overflow-hidden group">
                            {image.imageUrl ? (
                                <>
                                    <button onClick={() => setSelectedImage(image)} className="w-full h-full">
                                        <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                                    </button>
                                     <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEditClick(image)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-teal-500/50 transition-colors"
                                            aria-label="Edit image"
                                        > <EditIcon className="w-5 h-5"/> </button>
                                         <button 
                                            onClick={() => onGenerateVariations(image.prompt)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-blue-500/50 transition-colors"
                                            aria-label="Generate variations"
                                        > <GridIcon className="w-5 h-5"/> </button>
                                        <button 
                                            onClick={() => onUseAsStoryPrompt(image)}
                                            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-purple-500/50 transition-colors"
                                            aria-label="Use as story prompt"
                                        > <BookOpenIcon className="w-5 h-5"/> </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                     <div className="w-8 h-8 border-4 border-dashed border-gray-600 rounded-full animate-spin"></div>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {image.prompt}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 flex-shrink-0">
                <InputBar onSendMessage={onSendMessage} isProcessing={isProcessing} mode={ViewType.IMAGE} />
            </div>
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onGenerateVariations={onGenerateVariations}
                    onUseAsStoryPrompt={onUseAsStoryPrompt}
                />
            )}
            {imageToEdit && (
                <ImageEditModal image={imageToEdit} onClose={() => setImageToEdit(null)} onEdit={onEditImage} isProcessing={isProcessing} />
            )}
        </div>
    );
};

export default ImageView;