import React, { useState, useMemo } from 'react';
import { GameNews } from '../types';
import { InfoIcon, SuccessIcon, WarningIcon, DangerIcon } from './Icons';

interface NewsFeedProps {
    news: GameNews[];
}

const getIcon = (type: GameNews['type']) => {
    switch (type) {
        case 'success': return <SuccessIcon className="text-green-400" />;
        case 'warning': return <WarningIcon className="text-yellow-400" />;
        case 'danger': return <DangerIcon className="text-red-400" />;
        case 'info':
        default:
            return <InfoIcon className="text-blue-400" />;
    }
};

const NewsItem: React.FC<{ item: GameNews }> = React.memo(({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const canBeTruncated = item.message.length > 80;

    const toggleExpansion = () => {
        if (canBeTruncated) {
            setIsExpanded(!isExpanded);
        }
    };

    const displayMessage = useMemo(() => {
        if (canBeTruncated && !isExpanded) {
            return `${item.message.substring(0, 77)}...`;
        }
        return item.message;
    }, [item.message, isExpanded, canBeTruncated]);

    return (
        <li 
            className={`flex items-start gap-3 text-sm animate-fade-in transition-colors duration-200 p-2 ${canBeTruncated ? 'cursor-pointer hover:bg-slate-700/50 rounded-md' : ''}`}
            onClick={toggleExpansion}
            title={canBeTruncated ? "Click to expand" : ""}
        >
            <div className="mt-1 flex-shrink-0">{getIcon(item.type)}</div>
            <p className="text-slate-300 break-words w-full">{displayMessage}</p>
        </li>
    );
});

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-64 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2 flex-shrink-0">News & Events</h3>
            <div className="overflow-y-auto flex-grow pr-2">
                <ul className="space-y-1">
                    {news.map((item) => (
                        <NewsItem key={item.id} item={item} />
                    ))}
                </ul>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NewsFeed;