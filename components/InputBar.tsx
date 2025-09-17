import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { SendIcon, PaperclipIcon, CloseIcon } from './icons/Icons';
import { ViewType, ChatMessage } from '../types';

interface InputBarProps {
    onSendMessage: (prompt: string, image?: ChatMessage['uploadedImage']) => void;
    isProcessing: boolean;
    mode: ViewType;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isProcessing, mode }) => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleSubmit = () => {
        if ((prompt.trim() || imageFile) && !isProcessing) {
            const uploadedImage = imageFile && imagePreview
                ? { url: imagePreview, mimeType: imageFile.type }
                : undefined;
            onSendMessage(prompt, uploadedImage);
            setPrompt('');
            setImageFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [prompt]);

    const placeholderText = mode === ViewType.IMAGE 
        ? "Jelaskan gambar yang ingin dibuat..."
        : "Tanyakan apa saja, atau lampirkan gambar...";
        
    const canUpload = mode !== ViewType.IMAGE;

    return (
        <div className="w-full relative">
            {imagePreview && (
                <div className="absolute bottom-full left-4 mb-2 p-1 bg-gray-900/70 backdrop-blur-sm rounded-lg">
                    <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-md" />
                        <button 
                            onClick={() => setImageFile(null)}
                            className="absolute -top-2 -right-2 bg-gray-700 rounded-full p-0.5 text-white"
                        >
                            <CloseIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}
            <div className="relative flex items-end gap-2">
                <div className="flex-shrink-0">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing || !canUpload}
                        className={`w-13 h-13 flex items-center justify-center rounded-2xl bg-gray-800/50 border border-gray-700 text-gray-400 transition-colors ${canUpload ? 'hover:text-white' : 'invisible pointer-events-none'}`}
                        aria-label="Attach image"
                        style={{padding: '13px'}}
                    >
                        <PaperclipIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="relative flex-1">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={placeholderText}
                        rows={1}
                        className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl py-3 pl-6 pr-16 resize-none text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/80 transition-shadow duration-300"
                        style={{ minHeight: '52px', maxHeight: '200px' }}
                        disabled={isProcessing}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || (!prompt.trim() && !imageFile)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputBar;