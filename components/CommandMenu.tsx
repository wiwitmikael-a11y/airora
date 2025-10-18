import React, { useState } from 'react';
import { ViewType } from '../types';
import { 
    ChatAltIcon, 
    BeakerIcon, 
    FeatherIcon, 
    TerminalIcon, 
    ImageIcon, 
    VideoRecorderIcon, 
    TrashIcon, 
    CloseIcon, 
    MagnifyingGlassIcon,
    WrenchScrewdriverIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    MicrophoneIcon
} from './icons/Icons';
import { playSound } from '../sound';

interface SettingsMenuProps {
    onEndSession: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onEndSession, isMuted, onToggleMute }) => {
    const menuItems = [
        { 
            icon: isMuted ? SpeakerXMarkIcon : SpeakerWaveIcon, 
            label: isMuted ? 'Unmute Sounds' : 'Mute Sounds', 
            action: onToggleMute 
        },
        { icon: TrashIcon, label: 'End Session', action: onEndSession },
    ];

    return (
        <div className="w-52 glass-glow rounded-xl p-2">
            <div className="space-y-1">
                {menuItems.map(({ icon: Icon, label, action }) => (
                    <button
                        key={label}
                        onClick={() => {
                            playSound('click');
                            action();
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className="w-full flex items-center text-left px-3 py-2 text-gray-200 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
                    >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};


interface CommandMenuProps {
    onSelectView: (view: ViewType) => void;
    onEndSession: () => void;
    onClose: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ onSelectView, onEndSession, onClose, isMuted, onToggleMute }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const menuItems = [
        { icon: MicrophoneIcon, label: 'Live Conversation', action: () => onSelectView(ViewType.LIVE) },
        { icon: ChatAltIcon, label: 'General Chat', action: () => onSelectView(ViewType.CHAT) },
        { icon: MagnifyingGlassIcon, label: 'Researcher Mode', action: () => onSelectView(ViewType.RESEARCHER) },
        { icon: BeakerIcon, label: 'Visionary Mode', action: () => onSelectView(ViewType.VISIONARY) },
        { icon: FeatherIcon, label: 'Poetic Mode', action: () => onSelectView(ViewType.POETIC) },
        { icon: TerminalIcon, label: 'Code Mode', action: () => onSelectView(ViewType.CODE) },
        { icon: ImageIcon, label: 'Image Generator', action: () => onSelectView(ViewType.IMAGE) },
        { icon: VideoRecorderIcon, label: 'Video Generator', action: () => onSelectView(ViewType.VIDEO) },
    ];

    const handleClose = () => {
        setIsSettingsOpen(false);
        onClose();
    };

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-end justify-center">
             <div className={`transition-all duration-300 ease-out ${isSettingsOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                <div className="mr-2">
                    <SettingsMenu
                         isMuted={isMuted}
                         onToggleMute={onToggleMute}
                         onEndSession={onEndSession}
                    />
                </div>
            </div>

            <div className="w-64 glass-glow rounded-xl p-2 animate-fade-in">
                <div className="flex justify-between items-center mb-2 px-2">
                     <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Select Mode</p>
                     <button 
                        onClick={handleClose} 
                        onMouseEnter={() => playSound('hover')}
                        className="p-1 rounded-full hover:bg-gray-700/50"
                     >
                        <CloseIcon className="w-4 h-4 text-gray-400"/>
                     </button>
                </div>
                <div className="space-y-1">
                    {menuItems.map(({ icon: Icon, label, action }) => (
                        <button
                            key={label}
                            onClick={() => {
                                playSound('click');
                                action();
                            }}
                            onMouseEnter={() => playSound('hover')}
                            className="w-full flex items-center text-left px-3 py-2 text-gray-200 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
                <div className="w-full h-px bg-white/10 my-1"></div>
                 <button
                    onClick={() => {
                        playSound('click');
                        setIsSettingsOpen(!isSettingsOpen);
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="w-full flex items-center text-left px-3 py-2 text-gray-200 rounded-md hover:bg-gray-700/50 transition-colors duration-200"
                >
                    <WrenchScrewdriverIcon className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
};

export default CommandMenu;