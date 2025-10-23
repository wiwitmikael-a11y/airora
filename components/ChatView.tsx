import React, { useState, useCallback, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage, MessageRole, ViewType } from '../types';
import ChatWindow from './ChatWindow';
import { SYSTEM_INSTRUCTIONS, PRO_MODEL_ID, TEXT_MODEL_ID } from '../constants';

interface ChatViewProps {
    viewType: ViewType;
    isAnimatingOut: boolean;
    getAiInstance: () => GoogleGenAI | null;
}

const ChatView: React.FC<ChatViewProps> = ({ viewType, isAnimatingOut, getAiInstance }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);

    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';
    
    // Reset chat session when viewType changes
    useEffect(() => {
        chatRef.current = null;
        setMessages([]);
    }, [viewType]);

    const getModelId = () => {
        // Use Pro model for more complex tasks
        switch (viewType) {
            case ViewType.CODE:
            case ViewType.RESEARCHER:
                return PRO_MODEL_ID;
            default:
                return TEXT_MODEL_ID;
        }
    };
    
    const handleSendMessage = useCallback(async (prompt: string, image?: { base64: string; mimeType: string }) => {
        const ai = getAiInstance();
        if (!ai) return;

        setIsLoading(true);
        const userMessage: ChatMessage = {
            id: nanoid(),
            role: MessageRole.USER,
            content: prompt,
            ...(image && { uploadedImage: { url: `data:${image.mimeType};base64,${image.base64}`, mimeType: image.mimeType } }),
        };
        setMessages(prev => [...prev, userMessage]);

        const aiMessageId = nanoid();
        setMessages(prev => [...prev, { id: aiMessageId, role: MessageRole.AI, content: '', isLoading: true }]);
        
        try {
            const modelId = getModelId();
            
            if (image) {
                // For vision (image input), make a one-off call.
                const imagePart = { inlineData: { data: image.base64, mimeType: image.mimeType } };
                const textPart = { text: prompt };
                
                const response = await ai.models.generateContent({
                    // Use a vision-capable model
                    model: 'gemini-2.5-flash',
                    contents: { parts: [textPart, imagePart] },
                    config: { systemInstruction: SYSTEM_INSTRUCTIONS[viewType] }
                });
                
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: response.text, isLoading: false } : msg));
            } else {
                 // For text-only, use the persistent chat session
                 if (!chatRef.current) {
                    chatRef.current = ai.chats.create({
                        model: modelId,
                        config: { systemInstruction: SYSTEM_INSTRUCTIONS[viewType] },
                    });
                }
                
                const result = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of result) {
                    text += chunk.text;
                    setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: text, isLoading: true } : msg));
                }
                 setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, isLoading: false } : msg));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = "Sorry, I encountered an error. Please try again.";
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: errorMessage, isLoading: false } : msg));
        } finally {
            setIsLoading(false);
        }
    }, [viewType, getAiInstance]);
    
    return (
        <div className={`w-full h-full glass-glow rounded-3xl ${animationClass}`}>
            <ChatWindow
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                viewType={viewType}
                showImageUpload={true}
            />
        </div>
    );
};

export default ChatView;
