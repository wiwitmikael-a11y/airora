import React, { useEffect } from 'react';
import { GeneratedVideo } from '../types';
import { CloseIcon } from './icons/Icons';
import { playSound } from '../sound';

interface VideoModalProps {
    video: GeneratedVideo;
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        playSound('open');
        return () => playSound('close');
    }, []);

    if (!video.videoUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-4 max-w-4xl w-full relative animate-zoom-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-1.5 bg-gray-800 rounded-full z-10 hover:bg-gray-700">
                    <CloseIcon className="w-5 h-5 text-white" />
                </button>
                <video src={video.videoUrl} className="w-full h-auto rounded-lg" controls autoPlay loop />
                <p className="text-center text-gray-300 text-sm mt-4">{video.prompt}</p>
            </div>
        </div>
    );
};

export default VideoModal;
