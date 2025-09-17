import React from 'react';
import { ViewType } from '../types';
import { TextIcon, ImageIcon, TrashIcon, CloseIcon } from './icons/Icons';

interface CommandMenuProps {
    onSelectView: (view: ViewType) => void;
    onEndSession: () => void;
    onClose: () => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ onSelectView, onEndSession, onClose }) => {
    const menuItems = [
        { icon: TextIcon, label: 'Chat', action: () => onSelectView(ViewType.CHAT) },
        { icon: ImageIcon, label: 'Image', action: () => onSelectView(ViewType.IMAGE) },
        { icon: TrashIcon, label: 'End Session', action: onEndSession },
    ];

    return (
        <div className="absolute bottom-20 w-11/12 max-w-[290px] sm:w-64 sm:max-w-none left-1/2 -translate-x-1/2 glass-glow rounded-xl p-2 animate-fade-in">
            <div className="flex justify-between items-center mb-2 px-2">
                 <p className="text-xs text-gray-400 font-semibold">COMMANDS</p>
                 <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700/50">
                    <CloseIcon className="w-4 h-4 text-gray-400"/>
                 </button>
            </div>
            <div className="space-y-1">
                {menuItems.map(({ icon: Icon, label, action }) => (
                    <button
                        key={label}
                        onClick={action}
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

export default CommandMenu;