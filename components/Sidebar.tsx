import React from 'react';
import { ViewType } from '../types';
import {
    AtharrazkaCoreLogo,
    ChatBubbleIcon,
    GridIcon,
    FilmIcon,
    MicrophoneIcon,
    BeakerIcon,
    FeatherIcon,
    TerminalIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
} from './icons/Icons';
import { playSound } from '../sound';

interface SidebarProps {
    currentView: ViewType;
    onSelectView: (view: ViewType) => void;
    onEndSession: () => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

const SidebarButton: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label: string;
    view: ViewType;
    currentView: ViewType;
    onClick: (view: ViewType) => void;
}> = ({ icon: Icon, label, view, currentView, onClick }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => onClick(view)}
            onMouseEnter={() => playSound('hover')}
            className={`w-full flex items-center text-left px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-teal-500/20 text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            <Icon className={`w-5 h-5 mr-4 ${isActive ? 'text-teal-400' : ''}`} />
            <span>{label}</span>
        </button>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, onEndSession, isMuted, onToggleMute }) => {

    const mainModes = [
        { icon: ChatBubbleIcon, label: 'General Chat', view: ViewType.CHAT },
        { icon: GridIcon, label: 'Image Generation', view: ViewType.IMAGE },
        { icon: FilmIcon, label: 'Video Generation', view: ViewType.VIDEO },
        { icon: MicrophoneIcon, label: 'Live Conversation', view: ViewType.LIVE },
    ];

    const personaModes = [
        { icon: BeakerIcon, label: 'Visionary', view: ViewType.VISIONARY },
        { icon: FeatherIcon, label: 'Poet', view: ViewType.POETIC },
        { icon: TerminalIcon, label: 'Coder', view: ViewType.CODE },
        { icon: MagnifyingGlassIcon, label: 'Researcher', view: ViewType.RESEARCHER },
    ];


    return (
        <aside className="w-64 h-full flex-shrink-0 flex flex-col glass-glow rounded-3xl p-4">
            <div className="flex items-center gap-3 mb-6 px-2">
                <AtharrazkaCoreLogo className="w-10 h-10" />
                <div>
                    <h1 className="font-orbitron text-xl font-bold text-white tracking-wider">AIRORA</h1>
                    <p className="text-xs text-gray-400">Symbiotic AI</p>
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                <div>
                    <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Modes</h2>
                    <div className="space-y-1">
                        {mainModes.map(item => (
                            <SidebarButton
                                key={item.view}
                                {...item}
                                currentView={currentView}
                                onClick={onSelectView}
                            />
                        ))}
                    </div>
                </div>

                 <div>
                    <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Personas</h2>
                    <div className="space-y-1">
                        {personaModes.map(item => (
                            <SidebarButton
                                key={item.view}
                                {...item}
                                currentView={currentView}
                                onClick={onSelectView}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            <div className="mt-auto pt-4 border-t border-white/10 space-y-1 flex-shrink-0">
                <button
                    onClick={() => {
                        playSound('click');
                        onToggleMute();
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="w-full flex items-center text-left px-4 py-3 text-sm text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg"
                >
                    {isMuted ? <SpeakerXMarkIcon className="w-5 h-5 mr-4" /> : <SpeakerWaveIcon className="w-5 h-5 mr-4" />}
                    <span>{isMuted ? 'Unmute Sounds' : 'Mute Sounds'}</span>
                </button>
                 <button
                    onClick={() => {
                        playSound('endSession');
                        onEndSession();
                    }}
                    onMouseEnter={() => playSound('hover')}
                    className="w-full flex items-center text-left px-4 py-3 text-sm text-gray-400 hover:bg-gray-700/50 hover:text-white rounded-lg"
                >
                    <TrashIcon className="w-5 h-5 mr-4" />
                    <span>End Session</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
