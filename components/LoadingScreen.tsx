import React, { useState, useEffect } from 'react';
import { AiroraLogo } from './icons/Icons';

interface LoadingScreenProps {
    loreSnippets: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loreSnippets }) => {
    const [progress, setProgress] = useState(0);
    const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Animate progress bar
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress === 100) {
                    clearInterval(timer);
                    return 100;
                }
                return Math.min(oldProgress + 1, 100);
            });
        }, 90); // a bit faster than 10s to ensure it finishes

        return () => {
            clearInterval(timer);
        };
    }, []);

    // Change lore snippet based on progress
    useEffect(() => {
        // Show 5 distinct snippets during the loading process for a better paced narrative
        const numberOfSnippetsToShow = 5;
        const progressPerSnippet = 100 / numberOfSnippetsToShow;
        
        // Calculate which of the 5 "steps" we are in based on progress
        const targetStepIndex = Math.min(
            Math.floor(progress / progressPerSnippet),
            numberOfSnippetsToShow - 1
        );

        // If the calculated step is different from the current one, trigger a transition
        if (targetStepIndex !== currentSnippetIndex) {
            setIsFading(true); // Start fading out the old snippet
            setTimeout(() => {
                setCurrentSnippetIndex(targetStepIndex); // Change the snippet step
                setIsFading(false); // Start fading in the new snippet
            }, 500); // This duration should match the CSS fade-out time
        }
    }, [progress, currentSnippetIndex]);

    // This logic ensures we show the first 4 snippets and then the final "welcome" snippet.
    const getSnippet = () => {
        if (currentSnippetIndex < 4) {
            // For the first 4 steps, show the first 4 snippets
            return loreSnippets[currentSnippetIndex];
        }
        // For the 5th step (index 4), show the last snippet from the original array.
        return loreSnippets[loreSnippets.length - 1];
    };
    
    const currentSnippet = getSnippet();

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
