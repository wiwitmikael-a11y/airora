import React, { useEffect, useRef } from 'react';
import { ChatMessage, ViewType, MessageRole } from '../types';
import Message from './Message';
import InputBar from './InputBar';

interface ChatViewProps {
    messages: ChatMessage[];
    isProcessing: boolean;
    onSendMessage: (prompt: string, image?: ChatMessage['uploadedImage']) => void;
    isAnimatingOut: boolean;
    viewType: ViewType;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, isProcessing, onSendMessage, isAnimatingOut, viewType }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isUserScrolledUp = useRef(false);

    // This function checks the user's scroll position and updates the ref.
    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (!container) return;

        // A threshold to avoid floating point inaccuracies and register being "at the bottom".
        const scrollThreshold = 20;
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= scrollThreshold;
        
        // If the user is not at the bottom, it means they have scrolled up.
        isUserScrolledUp.current = !isAtBottom;
    };

    // Attach a scroll listener to the chat container to detect user actions.
    useEffect(() => {
        const container = chatContainerRef.current;
        container?.addEventListener('scroll', handleScroll, { passive: true });
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // This effect handles the intelligent auto-scrolling logic.
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        // We should always scroll to the bottom when the user sends a new message.
        const shouldForceScroll = lastMessage?.role === MessageRole.USER;

        if (shouldForceScroll) {
            isUserScrolledUp.current = false;
        }

        // Only auto-scroll if the user hasn't scrolled up manually.
        if (!isUserScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';

    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 flex-shrink-0">
                <InputBar 
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    mode={viewType}
                />
                <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2 px-2">
                    AIRORA dapat menampilkan informasi yang tidak akurat. Aplikasi ini dirancang hanya untuk tujuan edukasi dan eksperimental.
                </p>
            </div>
        </div>
    );
};

export default ChatView;