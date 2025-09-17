import React, { useState, useEffect } from 'react';
import { AiroraLogo } from './icons/Icons';

interface LoadingScreenProps {
    loreSnippets: string[];
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loreSnippets }) => {
    const [progress, setProgress] = useState(0);
    const [currentSnippet, setCurrentSnippet] = useState(loreSnippets[0]);
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

    // Cycle through lore snippets
    useEffect(() => {
        let snippetIndex = 0;
        const cycle = () => {
            setIsFading(true);
            setTimeout(() => {
                snippetIndex = (snippetIndex + 1) % loreSnippets.length;
                setCurrentSnippet(loreSnippets[snippetIndex]);
                setIsFading(false);
            }, 500); // fade out duration
        };
        const interval = setInterval(cycle, 2500); // change every 2.5s
        
        return () => clearInterval(interval);
    }, [loreSnippets]);


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
                    className={`text-center text-gray-400 mt-4 h-5 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    {currentSnippet}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
