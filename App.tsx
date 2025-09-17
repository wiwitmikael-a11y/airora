import React, { useState, useCallback } from 'react';
import { ViewType, ChatMessage, MessageRole, GeneratedImage } from './types';
import { TEXT_MODEL_ID, IMAGE_MODEL_ID } from './constants';
import CommandMenu from './components/CommandMenu';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import { SparklesIcon } from './components/icons/Icons';
// FIX: Import GoogleGenAI to use the Gemini API.
import { GoogleGenAI } from '@google/genai';

// FIX: Initialize the GoogleGenAI client. The API key is sourced from environment variables as required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>(ViewType.NONE);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // FIX: Removed isSessionStarted state as it was for puter.js authentication.

    const handleViewChange = (newView: ViewType) => {
        setIsMenuOpen(false);
        if (activeView !== ViewType.NONE) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setActiveView(newView);
                setIsAnimatingOut(false);
            }, 400); // Corresponds to fly-out animation duration
        } else {
            setActiveView(newView);
        }
    };

    const handleEndSession = () => {
        setIsMenuOpen(false);
        setIsAnimatingOut(true);
        setTimeout(() => {
            setActiveView(ViewType.NONE);
            setMessages([]);
            setImages([]);
            setIsAnimatingOut(false);
        }, 400);
    };

    const handleSendMessage = useCallback(async (prompt: string) => {
        if (!prompt) return;

        setIsProcessing(true);

        // FIX: Removed puter.js-specific authentication logic.
        
        if (activeView === ViewType.CHAT) {
            const userMessage: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, content: prompt };
            const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: MessageRole.AI, content: '', isLoading: true };
            setMessages(prev => [...prev, userMessage, aiMessage]);

            try {
                // FIX: Replaced puter.ai.chat with Gemini's generateContentStream for streaming chat responses.
                const response = await ai.models.generateContentStream({ model: TEXT_MODEL_ID, contents: prompt });
                let fullResponse = '';
                for await (const part of response) {
                    if(part?.text) {
                        fullResponse += part.text;
                        setMessages(prev => prev.map(msg => msg.id === aiMessage.id ? { ...msg, content: fullResponse } : msg));
                    }
                }
                setMessages(prev => prev.map(msg => msg.id === aiMessage.id ? { ...msg, isLoading: false } : msg));

            } catch (error) {
                console.error("Chat Error:", error);
                const errorContent = error instanceof Error ? error.message : "An unknown error occurred.";
                setMessages(prev => prev.map(msg => msg.id === aiMessage.id ? { ...msg, content: `Error: ${errorContent}`, isLoading: false } : msg));
            }

        } else if (activeView === ViewType.IMAGE) {
             const newImageId = Date.now().toString();
             // Add a placeholder while generating
             setImages(prev => [{id: newImageId, prompt: prompt, imageUrl: ''}, ...prev]);

            try {
                // FIX: Replaced puter.ai.txt2img with Gemini's generateImages for image generation.
                const imageResponse = await ai.models.generateImages({
                    model: IMAGE_MODEL_ID,
                    prompt: prompt,
                    config: {
                        numberOfImages: 1,
                    },
                });

                // FIX: Handle base64 response from Gemini API to create a data URL for the image.
                const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                
                setImages(prev => prev.map(img => img.id === newImageId ? { ...img, imageUrl } : img));
            } catch (error) {
                 console.error("Image Generation Error:", error);
                 // Remove the placeholder on error
                 setImages(prev => prev.filter(img => img.id !== newImageId));
            }
        }
        
        setIsProcessing(false);
    }, [activeView]);


    return (
        <div className="h-screen w-screen flex flex-col items-center justify-end p-4 md:p-8 relative">
            
            {/* Dynamic Views */}
            {activeView === ViewType.CHAT && (
                <ChatView 
                    messages={messages}
                    isProcessing={isProcessing}
                    onSendMessage={handleSendMessage}
                    isAnimatingOut={isAnimatingOut}
                />
            )}
            {activeView === ViewType.IMAGE && (
                <ImageView 
                    images={images}
                    isProcessing={isProcessing}
                    onSendMessage={handleSendMessage}
                    isAnimatingOut={isAnimatingOut}
                />
            )}

            {/* Floating Bubble Hint */}
            {activeView === ViewType.NONE && !isMenuOpen && (
                 <div className="absolute bottom-24 mb-4 glass-glow rounded-full px-4 py-2 text-sm text-gray-300 animate-fade-in">
                    Click the icon to begin
                </div>
            )}
            
            {/* Main Command Button & Menu */}
            <div className="relative z-50">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-16 h-16 rounded-full glass-glow flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    aria-label="Open Command Menu"
                >
                    <SparklesIcon className="w-8 h-8 text-white"/>
                </button>

                {isMenuOpen && (
                    <CommandMenu
                        onSelectView={handleViewChange}
                        onEndSession={handleEndSession}
                        onClose={() => setIsMenuOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default App;