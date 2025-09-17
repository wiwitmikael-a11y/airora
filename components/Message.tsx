import React, { useState } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { UserIcon, SparklesIcon, CopyIcon, CheckIcon } from './icons/Icons';

interface MessageProps {
    message: ChatMessage;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
    </div>
);

const BlinkingCursor: React.FC = () => (
    <span className="inline-block w-2 h-5 bg-teal-400 animate-pulse ml-1" style={{ animationDuration: '1s' }}></span>
);

const Message: React.FC<MessageProps> = ({ message }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === MessageRole.USER;

    const containerClasses = `flex items-start gap-4 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse' : ''}`;
    const avatarContainerClasses = `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-500/80' : 'bg-teal-500/80'}`;
    const messageBubbleClasses = `relative group px-5 py-3 rounded-xl max-w-2xl ${isUser ? 'bg-purple-500/20 text-gray-200' : 'bg-gray-800/60 text-gray-300'}`;
    
    const handleCopy = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderContent = () => {
        if (message.isLoading && !message.content) {
            return <LoadingIndicator />;
        }

        return (
            <>
                <div className="inline">
                    <p className="whitespace-pre-wrap inline">{message.content}</p>
                    {message.isLoading && message.content && <BlinkingCursor />}
                </div>
                {message.imageUrl && (
                    <div className="mt-4">
                        <img src={message.imageUrl} alt="Generated" className="rounded-lg max-w-sm" />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className={containerClasses}>
            <div className={avatarContainerClasses}>
                {isUser ? <UserIcon className="w-6 h-6 text-white"/> : <SparklesIcon className="w-6 h-6 text-white"/>}
            </div>
            <div className={messageBubbleClasses}>
                {renderContent()}
                 {!isUser && message.content && !message.isLoading && (
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 -right-10 p-1 rounded-full bg-gray-700/50 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy message"
                    >
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4"/>}
                    </button>
                 )}
            </div>
        </div>
    );
};

export default Message;
