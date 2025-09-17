import React, { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { SendIcon } from './icons/Icons';
import { ViewType } from '../types';

interface InputBarProps {
    onSendMessage: (prompt: string) => void;
    isProcessing: boolean;
    mode: ViewType;
}

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isProcessing, mode }) => {
    const [prompt, setPrompt] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        if (prompt.trim() && !isProcessing) {
            onSendMessage(prompt);
            setPrompt('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    
    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [prompt]);

    const placeholderText = mode === ViewType.CHAT 
        ? "Ask me anything..." 
        : "Describe an image to generate...";

    return (
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
                disabled={isProcessing || !prompt.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-purple-600 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default InputBar;
