import React, { useEffect } from 'react';
import { GeneratedImage } from '../types';
import { CloseIcon } from './icons/Icons';
import { playSound } from '../sound';

interface ImageModalProps {
    image: GeneratedImage;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    useEffect(() => {
        playSound('open');
        return () => playSound('close');
    }, []);

    if (!image.imageUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 max-w-4xl max-h-[90vh] flex flex-col gap-4 relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-1.5 bg-gray-800 rounded-full z-10 hover:bg-gray-700">
                    <CloseIcon className="w-5 h-5 text-white"/>
                </button>
                <img src={image.imageUrl} alt={image.prompt} className="w-full h-auto object-contain rounded-lg max-h-[calc(90vh-100px)]" />
                <p className="text-center text-gray-300 text-sm">{image.prompt}</p>
            </div>
        </div>
    );
};

export default ImageModal;
