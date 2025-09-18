import React from 'react';
import { AiroraLogo } from './icons/Icons';
import { playSound } from '../sound';

interface WelcomeScreenProps {
    onBegin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onBegin }) => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-4 z-10 animate-fade-in relative">
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
                onMouseEnter={() => playSound('hover')}
                className="px-8 py-3 rounded-full glass-glow font-semibold text-white transition-all duration-300 hover:scale-105 animate-begin-journey-pulse"
            >
                Begin Journey
            </button>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-6">
                AIRORA dapat menampilkan informasi yang tidak akurat. Aplikasi ini dirancang hanya untuk tujuan edukasi dan eksperimental.
            </p>
            <div className="absolute bottom-8 left-0 right-0 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                <p className="font-orbitron text-sm font-semibold text-white animate-text-glow">
                    Powered by Atharrazka Core
                </p>
                <p className="font-orbitron text-xs text-gray-500 tracking-widest mt-2">
                    Alpha Build v.01
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;