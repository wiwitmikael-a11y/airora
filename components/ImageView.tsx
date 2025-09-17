import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import InputBar from './InputBar';
import { ViewType } from '../types';
import { ImageIcon as PlaceholderIcon } from './icons/Icons';
import ImageModal from './ImageModal';

interface ImageViewProps {
    images: GeneratedImage[];
    isProcessing: boolean;
    onSendMessage: (prompt: string) => void;
    isAnimatingOut: boolean;
}

const ImageView: React.FC<ImageViewProps> = ({ images, isProcessing, onSendMessage, isAnimatingOut }) => {
    const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
    const animationClass = isAnimatingOut ? 'animate-fly-out' : 'animate-fly-in';

    return (
        <div className={`w-full h-[85%] max-w-5xl flex flex-col glass-glow rounded-3xl p-4 mb-6 ${animationClass}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {images.length === 0 && !isProcessing && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <PlaceholderIcon className="w-24 h-24 mb-4" />
                        <p>Generated images will appear here.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                        <div key={image.id} className="relative aspect-square bg-gray-900/50 rounded-lg overflow-hidden group">
                            {image.imageUrl ? (
                                <button onClick={() => setSelectedImage(image)} className="w-full h-full">
                                    <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                                </button>
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
                <InputBar 
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    mode={ViewType.IMAGE as any} // Cast needed as ModelType is structurally different now
                />
            </div>
            {selectedImage && (
                <ImageModal
                    imageUrl={selectedImage.imageUrl}
                    prompt={selectedImage.prompt}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
};

export default ImageView;
