import React, { useState, useEffect } from 'react';
import { GeneratedVideo, ChatMessage } from '../types';
import InputBar from './InputBar';
import { ViewType } from '../types';
import { FilmIcon as PlaceholderIcon } from './icons/Icons';
import { EMPTY_GALLERY_MESSAGES } from '../constants';
import VideoModal from './VideoModal';
import { playSound } from '../sound';

// FIX: The AIStudio interface and window augmentation have been moved to types.ts
// to serve as a single source of truth and prevent type conflicts.

interface VideoViewProps {
    videos: GeneratedVideo[];
    isProcessing: boolean;
    onGenerateVideo: (prompt: string, image?: ChatMessage['uploadedImage'], onError?: (error: Error) => void) => void;
    isAnimatingOut: boolean;
    onUseVideoForStory: (prompt: string) => void;
}

const videoGenerationMessages = [
    "Menganimasikan foton...",
    "Merangkai alur cerita digital...",
    "Ini mungkin memakan waktu beberapa menit...",
    "Mensintesis mimpi menjadi kenyataan...",
    "Rendering universe in motion...",
];

const VideoCard: React.FC<{ video: GeneratedVideo, onClick: () => void }> = ({ video, onClick }) => {
    const [currentMessage, setCurrentMessage] = useState(videoGenerationMessages[0]);

    useEffect(() => {
        if (video.status === 'processing') {
            const intervalId = setInterval(() => {
                setCurrentMessage(prev => {
                    const currentIndex = videoGenerationMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % videoGenerationMessages.length;
                    return videoGenerationMessages[nextIndex];
                });
            }, 3000);
            return () => clearInterval(intervalId);
        }
    }, [video.status]);

    return (
        <div className="relative aspect-video bg-gray-900/50 rounded-lg overflow-hidden group">
            {video.status === 'completed' && video.videoUrl ? (
                <>
                    <button onClick={onClick} onMouseEnter={() => playSound('hover')} className="w-full h-full">
                        <video src={video.videoUrl} className="w-full h-full object-cover" loop autoPlay muted playsInline />
                    </button>
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-16 h-16 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    {video.status === 'processing' ? (
                        <>
                            <div className="w-8 h-8 border-4 border-dashed border-gray-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-gray-400">{currentMessage}</p>
                        </>
                    ) : (
                        <div className="text-red-400">
                            <p>Gagal Membuat</p>
                            <p className="text-xs text-gray-500 mt-1">Silakan coba lagi.</p>
                        </div>
                    )}
                    {video.uploadedImage && (
                         <img src={video.uploadedImage.url} alt="Input image" className="absolute bottom-2 left-2 w-12 h-12 object-cover rounded-md border-2 border-gray-700" />
                    )}
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {video.prompt}
            </div>
        </div>
    );
};


const VideoView: React.FC<VideoViewProps> = ({ videos, isProcessing, onGenerateVideo, isAnimatingOut, onUseVideoForStory }) => {
    const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
    const [hasKey, setHasKey] = useState<boolean | null>(null); // null is the initial loading state
    const [initialImage, setInitialImage] = useState<ChatMessage['uploadedImage'] | null>(null);
    const animationClass = isAnimatingOut ? 'animate-recede' : 'animate-emerge';

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                setHasKey(await window.aistudio.hasSelectedApiKey());
            } else {
                console.warn('aistudio context not available.');
                setHasKey(true); // Fallback for environments where aistudio might not be injected
            }
        };
        checkKey();

        // Check for an initial image from another view
        try {
            const initImageData = sessionStorage.getItem('airora_init_image_for_video');
            if (initImageData) {
                const image = JSON.parse(initImageData);
                setInitialImage(image);
                sessionStorage.removeItem('airora_init_image_for_video');
            }
        } catch (e) {
            console.error("Failed to process initial image for video", e);
            sessionStorage.removeItem('airora_init_image_for_video');
        }

    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success and update UI immediately to avoid race conditions
            setHasKey(true);
        }
    };
    
    const handleApiError = (error: Error) => {
        // This is a special error message indicating the selected key is not valid for Veo.
        if (error.message.includes('Requested entity was not found')) {
            setHasKey(false);
        }
    };

    const handleGenerateWithCallback = (prompt: string, image?: ChatMessage['uploadedImage']) => {
        onGenerateVideo(prompt, image, handleApiError);
    };

    const renderContent = () => {
        if (hasKey === null) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-dashed border-gray-600 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!hasKey) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <h3 className="text-xl font-bold font-orbitron text-white mb-2">API Key Required</h3>
                    <p className="text-gray-400 max-w-md mb-6">
                        Video generation requires selecting your own Google Cloud API key with billing enabled. This is a free, one-time setup.
                    </p>
                    <button
                        onClick={handleSelectKey}
                        className="px-6 py-2 rounded-lg bg-teal-500/80 hover:bg-teal-500 text-white font-semibold transition-colors"
                    >
                        Select API Key
                    </button>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-400 hover:underline mt-4">
                        Learn more about API keys and billing
                    </a>
                </div>
            );
        }
        
        return (
            <>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {videos.length === 0 && !isProcessing && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <PlaceholderIcon className="w-24 h-24 mb-4" />
                            <p>{EMPTY_GALLERY_MESSAGES[ViewType.VIDEO]}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} onClick={() => { playSound('click'); setSelectedVideo(video); }} />
                        ))}
                    </div>
                </div>
                <div className="mt-4 flex-shrink-0">
                    <InputBar 
                        onSendMessage={handleGenerateWithCallback} 
                        isProcessing={isProcessing} 
                        mode={ViewType.VIDEO} 
                        initialImage={initialImage}
                    />
                    <p className="text-[10px] md:text-xs text-gray-500 text-left mt-2 px-2">
                        AIRORA dapat menampilkan informasi yang tidak akurat. Aplikasi ini dirancang hanya untuk tujuan edukasi dan eksperimental.
                    </p>
                </div>
            </>
        );
    };

    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            {renderContent()}
            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onUseForStory={onUseVideoForStory}
                />
            )}
        </div>
    );
};

export default VideoView;