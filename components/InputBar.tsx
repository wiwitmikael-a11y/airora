import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { SendIcon, PaperclipIcon, CloseIcon } from './icons/Icons';
import { playSound } from '../sound';

interface InputBarProps {
    onSendMessage: (prompt: string, image?: { base64: string, mimeType: string }) => void;
    isLoading: boolean;
    showImageUpload?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, showImageUpload = false }) => {
    const [inputValue, setInputValue] = useState('');
    const [uploadedImage, setUploadedImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if ((inputValue.trim() || uploadedImage) && !isLoading) {
            playSound('send');
            onSendMessage(inputValue.trim(), uploadedImage ? { base64: uploadedImage.base64, mimeType: uploadedImage.mimeType } : undefined);
            setInputValue('');
            setUploadedImage(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const base64 = dataUrl.split(',')[1];
                setUploadedImage({ url: dataUrl, base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUploadClick = () => {
        playSound('click');
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        playSound('close');
        setUploadedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [inputValue]);

    return (
        <div className="w-full glass-glow p-1 rounded-2xl flex flex-col">
            {uploadedImage && (
                <div className="p-2 relative w-fit">
                    <img src={uploadedImage.url} alt="upload preview" className="max-h-24 rounded-lg" />
                    <button onClick={removeImage} className="absolute top-3 right-3 bg-black/50 p-1 rounded-full text-white hover:bg-black/70">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="flex items-end p-2">
                {showImageUpload && (
                    <>
                        <button
                            onClick={handleUploadClick}
                            onMouseEnter={() => playSound('hover')}
                            className="p-2 text-gray-400 hover:text-white transition-colors mr-2 flex-shrink-0"
                            aria-label="Attach image"
                        >
                            <PaperclipIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </>
                )}
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask AIRORA anything..."
                    className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-48 custom-scrollbar text-sm"
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    onMouseEnter={() => playSound('hover')}
                    disabled={isLoading || (!inputValue.trim() && !uploadedImage)}
                    className="ml-4 p-2.5 bg-teal-500/50 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-500/70 flex-shrink-0"
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default InputBar;
