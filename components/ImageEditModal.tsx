import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, SparklesIcon } from './icons/Icons';
import { ImageForEditing } from '../types';

interface ImageEditModalProps {
    image: ImageForEditing;
    onClose: () => void;
    onEdit: (imageToEdit: ImageForEditing, prompt: string) => void;
    isProcessing: boolean;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ image, onClose, onEdit, isProcessing }) => {
    const [prompt, setPrompt] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSubmit = () => {
        if (prompt.trim() && !isProcessing) {
            onEdit(image, prompt);
            onClose();
        }
    };

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in"
            onClick={(e) => {
                if(modalRef.current === e.target) onClose();
            }}
        >
            <div className="relative w-11/12 max-w-lg glass-glow rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Edit Image</h2>
                <div className="mb-4 aspect-square rounded-lg overflow-hidden bg-gray-900/50">
                     <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-contain" />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your edits... (e.g., add a hat)"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl py-3 pl-4 pr-14 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80"
                        disabled={isProcessing}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-purple-600 text-white transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                        aria-label="Generate edit"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <CloseIcon className="w-6 h-6 text-gray-400"/>
                </button>
            </div>
        </div>
    );
};

export default ImageEditModal;
