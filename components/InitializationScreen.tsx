import React from 'react';
import { AtharrazkaCoreLogo } from './icons/Icons';

const InitializationScreen: React.FC = () => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4 z-10 bg-black">
             <AtharrazkaCoreLogo className="w-32 h-32 text-white/50 animate-pulse" />
             <p className="text-gray-400 mt-4 font-orbitron">Initializing...</p>
        </div>
    );
};

export default InitializationScreen;
