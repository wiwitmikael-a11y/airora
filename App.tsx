import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ViewType } from './types';
import { LORE_SNIPPETS } from './constants';

import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import ConfigurationErrorScreen from './components/ConfigurationErrorScreen';
import InitializationScreen from './components/InitializationScreen';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import VideoView from './components/VideoView';
import LiveView from './components/LiveView';
import { getMutedState, playSound, setMutedState } from './sound';

const App: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAppVisible, setAppVisible] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [showLoading, setShowLoading] = useState(false);
    const [isConfigError, setIsConfigError] = useState(false);
    const [currentView, setCurrentView] = useState<ViewType>(ViewType.NONE);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const [isMuted, setIsMuted] = useState(getMutedState());
    const aiRef = useRef<GoogleGenAI | null>(null);

    const getAiInstance = useCallback((): GoogleGenAI | null => {
        if (!process.env.API_KEY) {
            console.error("API key is missing.");
            if (!isConfigError) setIsConfigError(true);
            return null;
        }
        // Create a new instance only if one doesn't exist, to avoid re-creation on every call
        if (!aiRef.current) {
            try {
                // FIX: Initialize GoogleGenAI with a named apiKey parameter.
                aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
            } catch (e) {
                console.error("Failed to initialize GoogleGenAI", e);
                if (!isConfigError) setIsConfigError(true);
                return null;
            }
        }
        return aiRef.current;
    }, [isConfigError]);

    useEffect(() => {
        // Check for API key existence on mount.
        if (typeof process.env.API_KEY !== 'string' || process.env.API_KEY === '') {
            setIsConfigError(true);
        }
        setIsInitializing(false);
    }, []);

    const handleBegin = () => {
        playSound('open');
        setShowLoading(true);
        // Simulate a loading time for dramatic effect.
        setTimeout(() => {
            setIsInitialized(true);
            setShowLoading(false);
            setAppVisible(true);
        }, 10000); 
    };
    
    const handleSelectView = (view: ViewType) => {
        if (currentView === view) return;
        
        playSound('click');
        setIsAnimatingOut(true);

        // Allow time for the exit animation before switching the view.
        setTimeout(() => {
            setCurrentView(view);
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleEndSession = () => {
        playSound('endSession');
        setAppVisible(false);
        // Reset application state after the fade-out animation.
        setTimeout(() => {
            setIsInitialized(false);
            setCurrentView(ViewType.NONE);
            // Here you would also reset other states like chat messages, images, etc.
        }, 500);
    };
    
    const handleToggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        setMutedState(newMutedState);
        if (!newMutedState) {
            playSound('click');
        }
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case ViewType.CHAT:
            case ViewType.VISIONARY:
            case ViewType.POETIC:
            case ViewType.CODE:
            case ViewType.RESEARCHER:
                return <ChatView key={currentView} viewType={currentView} isAnimatingOut={isAnimatingOut} getAiInstance={getAiInstance} />;
            case ViewType.IMAGE:
                return <ImageView key={currentView} isAnimatingOut={isAnimatingOut} getAiInstance={getAiInstance} />;
            case ViewType.VIDEO:
                return <VideoView key={currentView} isAnimatingOut={isAnimatingOut} getAiInstance={getAiInstance} />;
            case ViewType.LIVE:
                return <LiveView key={currentView} isAnimatingOut={isAnimatingOut} getAiInstance={getAiInstance} />;
            default:
                return (
                    <div className={`w-full h-full flex items-center justify-center text-gray-400 ${isAnimatingOut ? 'animate-recede' : 'animate-emerge'}`}>
                        Select a mode from the sidebar to begin.
                    </div>
                );
        }
    };
    
    if (isConfigError) {
        return <ConfigurationErrorScreen />;
    }

    if (isInitializing) {
        return <InitializationScreen />;
    }

    if (!isInitialized) {
        if (showLoading) {
            return <LoadingScreen loreSnippets={LORE_SNIPPETS} />;
        }
        return <WelcomeScreen onBegin={handleBegin} />;
    }

    return (
        <div className={`h-screen w-screen bg-black text-white flex items-center justify-center font-sans overflow-hidden transition-opacity duration-500 ${isAppVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="aurora-background"></div>
            <div className="h-full w-full flex p-4 gap-4 z-10">
                <Sidebar
                    currentView={currentView}
                    onSelectView={handleSelectView}
                    onEndSession={handleEndSession}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                />
                <main className="flex-1 h-full min-w-0">
                    {renderCurrentView()}
                </main>
            </div>
        </div>
    );
};

export default App;
