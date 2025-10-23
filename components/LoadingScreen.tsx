import React, { useState, useEffect } from 'react';
import { AiroraLogo } from './icons/Icons';

interface LoadingScreenProps {
    loreSnippets: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loreSnippets }) => {
    const [progress, setProgress] = useState(0);
    const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Animate progress bar over ~9 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return Math.min(oldProgress + 1, 100);
            });
        }, 90);

        return () => {
            clearInterval(timer);
        };
    }, []);

    // Change lore snippet based on progress
    useEffect(() => {
        if (!loreSnippets || loreSnippets.length === 0) return;
        
        const numberOfSnippetsToShow = loreSnippets.length;
        const progressPerSnippet = 100 / numberOfSnippetsToShow;
        
        const targetIndex = Math.min(
            Math.floor(progress / progressPerSnippet),
            numberOfSnippetsToShow - 1
        );

        if (targetIndex !== currentSnippetIndex) {
            setIsFading(true);
            setTimeout(() => {
                setCurrentSnippetIndex(targetIndex);
                setIsFading(false);
            }, 500); // Match CSS fade-out time
        }
    }, [progress, currentSnippetIndex, loreSnippets]);
    
    const currentSnippet = loreSnippets[currentSnippetIndex] || '';

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
            <AiroraLogo className="w-32 h-32 text-white/50" />
            
            <div className="w-full max-w-md mt-8">
                <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-150 ease-linear" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p 
                    className={`text-center text-gray-400 mt-4 h-10 flex items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    {currentSnippet}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;