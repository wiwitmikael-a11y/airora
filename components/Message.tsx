import React, { useState } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, AiroraLogo, CopyIcon, CheckIcon, ShareIcon } from './icons/Icons';

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AIRORA Response',
                    text: message.content,
                });
            } catch (error) {
                const err = error as Error;
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    // Fallback to copy for other errors
                    handleCopy();
                    alert('Sharing failed, content copied to clipboard.');
                }
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            handleCopy();
            alert('Sharing not supported, content copied to clipboard.');
        }
    };

    const isUser = message.role === MessageRole.USER;

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <AiroraLogo className="w-5 h-5" />
                </div>
            )}
            <div className="max-w-2xl group relative">
                <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-teal-500/30' : 'bg-gray-800/50 backdrop-blur-sm'}`}>
                    {message.uploadedImage && (
                        <div className="mb-2 rounded-lg overflow-hidden max-w-[200px]">
                            <img src={message.uploadedImage.url} alt="User upload" className="w-full h-full object-cover"/>
                        </div>
                    )}
                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {message.isLoading ? (
                            <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        ) : (
                            message.content
                        )}
                    </div>
                </div>
                {!isUser && !message.isLoading && message.content && (
                     <div className="absolute -bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors"
                            aria-label="Copy message"
                        >
                            {copied ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 transition-colors"
                            aria-label="Share message"
                        >
                            <ShareIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
            )}
        </div>
    );
};

export default Message;
