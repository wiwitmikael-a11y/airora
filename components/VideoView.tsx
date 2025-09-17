import React, { useState, useEffect } from 'react';
import { GeneratedVideo, ChatMessage } from '../types';
import InputBar from './InputBar';
import { ViewType } from '../types';
import { FilmIcon as PlaceholderIcon } from './icons/Icons';
import VideoModal from './VideoModal';

interface VideoViewProps {
    videos: GeneratedVideo[];
    isProcessing: boolean;
    onGenerateVideo: (prompt: string, image?: ChatMessage['uploadedImage']) => void;
    isAnimatingOut: boolean;
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
                    <button onClick={onClick} className="w-full h-full">
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


const VideoView: React.FC<VideoViewProps> = ({ videos, isProcessing, onGenerateVideo, isAnimatingOut }) => {
    const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
    const animationClass = isAnimatingOut ? 'animate-fly-out' : 'animate-fly-in';

    return (
        <div className={`w-full h-full max-w-5xl flex flex-col glass-glow rounded-3xl p-4 ${animationClass}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {videos.length === 0 && !isProcessing && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <PlaceholderIcon className="w-24 h-24 mb-4" />
                        <p>Video yang dihasilkan akan muncul di sini.</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video) => (
                        <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
                    ))}
                </div>
            </div>
            <div className="mt-4 flex-shrink-0">
                <InputBar onSendMessage={onGenerateVideo} isProcessing={isProcessing} mode={ViewType.VIDEO} />
            </div>
            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
};

export default VideoView;