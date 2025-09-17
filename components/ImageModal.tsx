import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, CheckIcon, ShareIcon, GridIcon, BookOpenIcon } from './icons/Icons';
import { GeneratedImage } from '../types';

interface ImageModalProps {
    image: GeneratedImage;
    onClose: () => void;
    onGenerateVariations: (prompt: string) => void;
    onUseAsStoryPrompt: (image: GeneratedImage) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onGenerateVariations, onUseAsStoryPrompt }) => {
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.imageUrl;
        const safePrompt = image.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${safePrompt.slice(0, 30)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], fileName, { type: blob.type });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const file = await dataUrlToFile(image.imageUrl, 'airora-generated-image.png');
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Image from AIRORA',
                        text: image.prompt,
                        files: [file],
                    });
                } else {
                     await navigator.share({ title: 'Image from AIRORA', text: image.prompt, url: image.imageUrl });
                }
            } catch (error) {
                const err = error as Error;
                if (err.name !== 'AbortError') {
                     console.error('Error sharing:', err);
                     alert('Could not share image.');
                }
            }
        } else {
            alert('Sharing not supported on this browser.');
        }
    };

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in"
            onClick={(e) => { if(modalRef.current === e.target) onClose(); }}
        >
            <div className="relative w-11/12 max-w-4xl max-h-[90vh] flex flex-col glass-glow rounded-2xl p-6">
                <div className="flex-1 min-h-0 flex items-center justify-center mb-4">
                     <img src={image.imageUrl} alt={image.prompt} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                </div>
                
                <div className="flex-shrink-0 bg-gray-900/50 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm mb-3">{image.prompt}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                            {copied ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <CopyIcon className="w-4 h-4" />}
                            <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                        </button>
                         <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                            <DownloadIcon className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                        <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                            <ShareIcon className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                         <button onClick={() => onGenerateVariations(image.prompt)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                            <GridIcon className="w-4 h-4" />
                            <span>Variations</span>
                        </button>
                         <button onClick={() => onUseAsStoryPrompt(image)} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs transition-colors">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>Story Prompt</span>
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <CloseIcon className="w-6 h-6 text-gray-400"/>
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
