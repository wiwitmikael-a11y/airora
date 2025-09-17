import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import InputBar from './InputBar';
import { ViewType } from '../types';

interface ChatViewProps {
    messages: ChatMessage[];
    isProcessing: boolean;
    onSendMessage: (prompt: string) => void;
    isAnimatingOut: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, isProcessing, onSendMessage, isAnimatingOut }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const animationClass = isAnimatingOut ? 'animate-fly-out' : 'animate-fly-in';

    return (
        <div className={`w-full h-[85%] max-w-5xl flex flex-col glass-glow rounded-3xl p-4 mb-6 ${animationClass}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex-shrink-0">
                <InputBar 
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    mode={ViewType.CHAT as any} // Cast needed as ModelType is structurally different now
                />
            </div>
        </div>
    );
};

export default ChatView;
