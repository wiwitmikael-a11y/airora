import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, DownloadIcon, ZoomInIcon, ZoomOutIcon } from './icons/Icons';

interface ImageModalProps {
    imageUrl: string;
    prompt: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, prompt, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const modalRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={(e) => {
                if(modalRef.current === e.target) onClose();
            }}
        >
            <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={prompt}
                    className="max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 glass-glow p-2 rounded-full">
                     <button onClick={handleZoomOut} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ZoomOutIcon className="w-6 h-6 text-white"/>
                    </button>
                    <a
                        href={imageUrl}
                        download={`airora-image-${Date.now()}.png`}
                        className="p-3 rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 text-white transition-transform hover:scale-110"
                        aria-label="Download image"
                    >
                        <DownloadIcon className="w-6 h-6"/>
                    </a>
                     <button onClick={handleZoomIn} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ZoomInIcon className="w-6 h-6 text-white"/>
                    </button>
                </div>
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full glass-glow hover:bg-white/10 transition-colors">
                    <CloseIcon className="w-6 h-6 text-white"/>
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
