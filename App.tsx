

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ViewType, ChatMessage, MessageRole, GeneratedImage, ImageForEditing, GeneratedVideo } from './types';
import { TEXT_MODEL_ID, IMAGE_MODEL_ID, IMAGE_EDIT_MODEL_ID, VIDEO_MODEL_ID, LORE_SNIPPETS, SYSTEM_INSTRUCTIONS, WELCOME_MESSAGES } from './constants';
import CommandMenu from './components/CommandMenu';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import VideoView from './components/VideoView';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import ConfigurationErrorScreen from './components/ConfigurationErrorScreen';
import { SparklesIcon, AiroraLogo } from './components/icons/Icons';
import { GoogleGenAI, Modality, Chat, Part, GenerateVideosOperation } from '@google/genai';
import { playSound, getMutedState, setMutedState } from './sound';

const getApiKey = (): string | undefined => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY;
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
};

const API_KEY = getApiKey();
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

type AppState = 'welcome' | 'loading' | 'active';

const isChatView = (view: ViewType) => {
    return [ViewType.CHAT, ViewType.VISIONARY, ViewType.POETIC, ViewType.CODE, ViewType.RESEARCHER].includes(view);
};

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('welcome');
    const [activeView, setActiveView] = useState<ViewType>(ViewType.NONE);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(getMutedState());
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [videos, setVideos] = useState<GeneratedVideo[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const chatSessionRef = useRef<Chat | null>(null);

    const fileToGenerativePart = async (file: File): Promise<Part> => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    // --- Session Management ---
    useEffect(() => {
        try {
            const savedSession = sessionStorage.getItem('airora_session');
            if (savedSession) {
                const { activeView: savedView, messages: savedMessages, images: savedImages, videos: savedVideos } = JSON.parse(savedSession);
                
                if (savedView && savedView !== ViewType.NONE) {
                    setActiveView(savedView);
                    setMessages(savedMessages || []);
                    setImages(savedImages || []);
                    setVideos(savedVideos || []);
                    
                    if (isChatView(savedView) && ai) {
                        chatSessionRef.current = ai.chats.create({
                            model: TEXT_MODEL_ID,
                            config: { systemInstruction: SYSTEM_INSTRUCTIONS[savedView] },
                            history: (savedMessages || [])
                                .filter((msg: ChatMessage) => !msg.isLoading && msg.id !== 'welcome')
                                .map((msg: ChatMessage) => ({
                                    role: msg.role === MessageRole.USER ? 'user' : 'model',
                                    parts: [{ text: msg.content }]
                                })),
                        });
                    }
                    
                    setAppState('active');
                }
            }
        } catch (error) {
            console.error("Failed to load session:", error);
            sessionStorage.removeItem('airora_session');
        }
    }, []);

    useEffect(() => {
        if (appState === 'active' && activeView !== ViewType.NONE) {
            try {
                const sessionData = {
                    activeView,
                    messages,
                    images,
                    videos
                };
                sessionStorage.setItem('airora_session', JSON.stringify(sessionData));
            } catch (error) {
                console.error("Failed to save session:", error);
            }
        }
    }, [activeView, messages, images, videos, appState]);


    const handleBegin = () => {
        playSound('open');
        setAppState('loading');
        setTimeout(() => setAppState('active'), 10000); 
    };

    const changeView = useCallback((newView: ViewType) => {
        playSound('open');
        setActiveView(newView);
        setIsAnimatingOut(false);
        setIsMenuOpen(false);

        if (isChatView(newView)) {
            setMessages([{ id: 'welcome', role: MessageRole.AI, content: WELCOME_MESSAGES[newView] }]);
            if (ai) {
                 chatSessionRef.current = ai.chats.create({
                    model: TEXT_MODEL_ID,
                    config: { systemInstruction: SYSTEM_INSTRUCTIONS[newView] },
                });
            }
        } else {
             setMessages([]); 
        }

    }, []);

    const handleSelectView = useCallback((newView: ViewType) => {
        if (activeView === ViewType.NONE || activeView !== newView) {
            if (activeView !== ViewType.NONE) {
                setIsAnimatingOut(true);
                setTimeout(() => changeView(newView), 400);
            } else {
                changeView(newView);
            }
        } else {
            setIsMenuOpen(false);
        }
    }, [activeView, changeView]);


    const handleEndSession = () => {
        playSound('endSession');
        setIsAnimatingOut(true);
        setTimeout(() => {
            setAppState('welcome');
            setActiveView(ViewType.NONE);
            setMessages([]);
            setImages([]);
            setVideos([]);
            setIsAnimatingOut(false);
            chatSessionRef.current = null;
            sessionStorage.removeItem('airora_session');
        }, 500);
    };

    const handleSendMessage = useCallback(async (prompt: string, uploadedImage?: ChatMessage['uploadedImage']) => {
        if ((!prompt || !prompt.trim()) && !uploadedImage) return;

        const userMessageId = `msg-${Date.now()}`;
        const userMessage: ChatMessage = {
            id: userMessageId,
            role: MessageRole.USER,
            content: prompt,
            uploadedImage,
        };
        setMessages(prev => [...prev, userMessage]);

        const aiMessageId = `msg-${Date.now() + 1}`;
        const aiLoadingMessage: ChatMessage = {
            id: aiMessageId,
            role: MessageRole.AI,
            content: '',
            isLoading: true,
        };
        setMessages(prev => [...prev, aiLoadingMessage]);
        setIsProcessing(true);
        playSound('receive_start');

        try {
            if (!chatSessionRef.current) throw new Error("Chat session not initialized.");

            const parts: Part[] = [];
            if (prompt && prompt.trim()) {
                parts.push({ text: prompt });
            }
            if (uploadedImage) {
                 const response = await fetch(uploadedImage.url);
                 const blob = await response.blob();
                 const file = new File([blob], "uploaded_image", { type: uploadedImage.mimeType });
                 const imagePart = await fileToGenerativePart(file);
                 parts.push(imagePart);
            }

            const stream = await chatSessionRef.current.sendMessageStream({ message: parts });
            
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                fullResponse += chunkText;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === aiMessageId ? { ...msg, content: fullResponse, isLoading: false } : msg
                    )
                );
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId ? { ...msg, content: 'Sorry, I encountered an error.', isLoading: false } : msg
                )
            );
        } finally {
            setIsProcessing(false);
            playSound('receive_end');
        }
    }, []);

    const handleGenerateImage = useCallback(async (prompt: string) => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        playSound('receive_start');

        const tempImageId = `img-${Date.now()}`;
        const tempImage: GeneratedImage = { id: tempImageId, prompt, imageUrl: '' };
        setImages(prev => [tempImage, ...prev]);

        try {
            if (!ai) throw new Error("AI client not initialized.");
            const response = await ai.models.generateImages({
                model: IMAGE_MODEL_ID,
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png' },
            });
            
            const base64Image = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64Image}`;

            setImages(prev =>
                prev.map(img => (img.id === tempImageId ? { ...img, imageUrl } : img))
            );

        } catch (error) {
            console.error('Error generating image:', error);
            setImages(prev => prev.filter(img => img.id !== tempImageId));
        } finally {
            setIsProcessing(false);
            playSound('receive_end');
        }
    }, []);

    const handleEditImage = useCallback(async (imageToEdit: ImageForEditing, prompt: string) => {
        setIsProcessing(true);
        playSound('receive_start');
        const tempImageId = `img-${Date.now()}`;
        const tempImage: GeneratedImage = { id: tempImageId, prompt: `Edit: ${prompt}`, imageUrl: '' };
        setImages(prev => [tempImage, ...prev]);

        try {
            if (!ai) throw new Error("AI client not initialized.");

            const imagePart = {
                inlineData: {
                    data: imageToEdit.base64,
                    mimeType: imageToEdit.mimeType,
                },
            };
            const textPart = { text: prompt };

            const response = await ai.models.generateContent({
                model: IMAGE_EDIT_MODEL_ID,
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imageContent = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imageContent && imageContent.inlineData) {
                const base64Image = imageContent.inlineData.data;
                const imageUrl = `data:${imageContent.inlineData.mimeType};base64,${base64Image}`;
                 setImages(prev =>
                    prev.map(img => (img.id === tempImageId ? { ...img, imageUrl } : img))
                );
            } else {
                 throw new Error("No image data in response.");
            }

        } catch (error) {
            console.error('Error editing image:', error);
            setImages(prev => prev.filter(img => img.id !== tempImageId));
        } finally {
            setIsProcessing(false);
            playSound('receive_end');
        }
    }, []);

    const handleGenerateVideo = useCallback(async (prompt: string, uploadedImage?: ChatMessage['uploadedImage']) => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        playSound('receive_start');

        const tempVideoId = `vid-${Date.now()}`;
        const tempVideo: GeneratedVideo = {
            id: tempVideoId,
            prompt,
            operationName: '',
            status: 'processing',
            uploadedImage: uploadedImage ? { url: uploadedImage.url } : undefined,
        };
        setVideos(prev => [tempVideo, ...prev]);

        try {
            if (!ai) throw new Error("AI client not initialized.");

            let imagePayload: { imageBytes: string; mimeType: string } | undefined = undefined;
            if (uploadedImage) {
                const response = await fetch(uploadedImage.url);
                const blob = await response.blob();
                const reader = new FileReader();
                const base64String = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                imagePayload = { imageBytes: base64String, mimeType: uploadedImage.mimeType };
            }

            let operation: GenerateVideosOperation = await ai.models.generateVideos({
                model: VIDEO_MODEL_ID,
                prompt: prompt,
                image: imagePayload,
                config: { numberOfVideos: 1 }
            });

            setVideos(prev => prev.map(v => v.id === tempVideoId ? { ...v, operationName: operation.name } : v));

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                 const downloadLink = operation.response.generatedVideos[0].video.uri;
                 const videoUrl = `${downloadLink}&key=${API_KEY}`;
                 setVideos(prev => prev.map(v => v.id === tempVideoId ? { ...v, status: 'completed', videoUrl } : v));
            } else {
                throw new Error("Video generation completed but no URL found.");
            }

        } catch (error) {
            console.error('Error generating video:', error);
            setVideos(prev => prev.map(v => v.id === tempVideoId ? { ...v, status: 'failed' } : v));
        } finally {
            setIsProcessing(false);
            playSound('receive_end');
        }
    }, []);

     const handleGenerateVariations = (prompt: string) => {
        handleGenerateImage(prompt);
    };

    const handleUseAsStoryPrompt = (image: GeneratedImage) => {
        handleSelectView(ViewType.POETIC);
        setTimeout(async () => {
             const response = await fetch(image.imageUrl);
             const blob = await response.blob();
             const uploadedImage = {
                url: image.imageUrl,
                mimeType: blob.type,
             };
            handleSendMessage(`Write a short, poetic story inspired by this image.`, uploadedImage);
        }, 500);
    };
    
    const handleToggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        setMutedState(newState);
        playSound('click');
    };

    if (!API_KEY) {
        return <ConfigurationErrorScreen />;
    }

    if (appState === 'welcome') {
        return <WelcomeScreen onBegin={handleBegin} />;
    }

    if (appState === 'loading') {
        return <LoadingScreen loreSnippets={LORE_SNIPPETS} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 pt-8 md:p-6 relative overflow-hidden">

            <div className="w-full h-full flex items-center justify-center pb-24">
                {activeView !== ViewType.NONE ? (
                    <>
                        {isChatView(activeView) && (
                            <ChatView
                                messages={messages}
                                isProcessing={isProcessing}
                                onSendMessage={handleSendMessage}
                                isAnimatingOut={isAnimatingOut}
                                viewType={activeView}
                            />
                        )}
                        {activeView === ViewType.IMAGE && (
                            <ImageView
                                images={images}
                                isProcessing={isProcessing}
                                onSendMessage={handleGenerateImage}
                                onEditImage={handleEditImage}
                                isAnimatingOut={isAnimatingOut}
                                onGenerateVariations={handleGenerateVariations}
                                onUseAsStoryPrompt={handleUseAsStoryPrompt}
                            />
                        )}
                        {activeView === ViewType.VIDEO && (
                            <VideoView
                                videos={videos}
                                isProcessing={isProcessing}
                                onGenerateVideo={handleGenerateVideo}
                                isAnimatingOut={isAnimatingOut}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-orbitron text-white">Select a Mode</h2>
                        <p className="text-gray-400 mt-2">Click the button below to begin your journey.</p>
                    </div>
                )}
            </div>

            {isMenuOpen && (
                 <CommandMenu
                    onSelectView={handleSelectView}
                    onEndSession={handleEndSession}
                    onClose={() => { playSound('close'); setIsMenuOpen(false); }}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                />
            )}
           
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 flex justify-center items-center gap-4">
                <button
                    onClick={() => {
                        playSound(isMenuOpen ? 'close' : 'open');
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className="p-4 rounded-full glass-glow transition-all duration-300 hover:scale-105 animate-rgb-glow"
                    aria-label={isMenuOpen ? "Close command menu" : "Open command menu"}
                >
                    <SparklesIcon className="w-8 h-8" />
                </button>
            </div>
            
            <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-2 text-center animate-fade-in z-10">
                <AiroraLogo className="w-5 h-5"/>
                <p className="font-orbitron text-xs font-semibold text-white/60">
                    Powered by Atharrazka Core
                </p>
            </div>
        </div>
    );
};

export default App;