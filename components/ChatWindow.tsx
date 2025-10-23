import React, { useRef, useEffect } from 'react';
import { ChatMessage, ViewType } from '../types';
import Message from './Message';
import InputBar from './InputBar';
import { WELCOME_MESSAGES } from '../constants';

interface ChatWindowProps {
    messages: ChatMessage[];
    onSendMessage: (prompt: string, image?: { base64: string, mimeType: string }) => void;
    isLoading: boolean;
    viewType: ViewType;
    showImageUpload?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, viewType, showImageUpload = false }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-center">
                        <p className="text-gray-400">{WELCOME_MESSAGES[viewType]}</p>
                    </div>
                ) : (
                    messages.map((message) => <Message key={message.id} message={message} />)
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="px-6 pb-6">
                <InputBar
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    showImageUpload={showImageUpload}
                />
                 <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2">
                    AIRORA can make mistakes. Consider checking important information.
                 </p>
            </div>
        </div>
    );
};

export default ChatWindow;
