import React from 'react';
import { AiroraLogo } from './icons/Icons';

const ConfigurationErrorScreen: React.FC = () => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-center p-8 z-10 animate-fade-in">
            <AiroraLogo className="w-24 h-24 text-red-500/50" />
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white tracking-widest my-4">
                Configuration Error
            </h1>
            <div className="max-w-2xl w-full glass-glow rounded-xl p-6 text-left space-y-4 text-gray-300">
                <p className="font-bold text-lg text-white">The application failed to start.</p>
                <p>
                    <strong>Cause:</strong> The application's API key is not accessible in the browser environment. Attempting to access `process.env.API_KEY` directly in the frontend code causes a fatal error.
                </p>
                <p>
                    <strong>Reason:</strong> This is an intentional security design. Deployment platforms like Vercel do not expose backend environment variables directly to the browser to prevent your secret API key from being stolen.
                </p>
                <div className="pt-2">
                    <p className="font-bold text-md text-teal-400">Recommended Solutions:</p>
                    <ul className="list-disc list-inside space-y-2 mt-2 text-sm">
                        <li>
                            <strong>Backend Function (Most Secure):</strong> Create a serverless function (an API endpoint) in your project. The frontend calls this endpoint, and the serverless function (which can securely access the `API_KEY`) then calls the Google Gemini API.
                        </li>
                        <li>
                            <strong>Frontend Framework Build:</strong> Use a framework like Vite or Next.js. These tools have specific ways to expose non-sensitive variables to the frontend (e.g., using a `VITE_` or `NEXT_PUBLIC_` prefix) during a build step. Vercel automatically supports this process for projects configured with these frameworks.
                        </li>
                    </ul>
                </div>
            </div>
             <p className="text-gray-500 text-sm mt-8">
                The application has been modified to show this screen instead of a blank page.
            </p>
        </div>
    );
};

export default ConfigurationErrorScreen;
