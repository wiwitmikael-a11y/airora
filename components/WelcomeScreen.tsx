import React from 'react';
import { AiroraLogo } from './icons/Icons';

interface WelcomeScreenProps {
    onBegin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in">
            <AiroraLogo className="w-48 h-48 md:w-64 md:h-64" />
            <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white tracking-widest my-4 animate-text-glow">
                AIRORA
            </h1>
            <p className="text-gray-300 max-w-md mb-8">
                Your symbiotic partner in creative exploration.
                Let's imagine something new together.
            </p>
            <button
                onClick={onBegin}
                className="px-8 py-3 rounded-full glass-glow font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-cyan-400/30"
            >
                Begin Journey
            </button>
            <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                <p className="text-sm font-semibold text-white animate-text-glow">
                    Powered by Atharrazka Core
                </p>
                <p className="text-xs text-gray-500 tracking-widest mt-2">
                    Alpha Build v.01
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;