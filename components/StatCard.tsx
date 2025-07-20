import React from 'react';
import { TrendUpIcon, TrendDownIcon } from './Icons';

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    format?: 'currency' | 'percentage' | 'none';
    change?: number | null;
    children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, format = 'none', change, children }) => {
    
    const formatValue = () => {
        if (typeof value === 'string') {
            return value;
        }
        switch (format) {
            case 'currency':
                return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
            case 'percentage':
                return `${value.toFixed(0)}%`;
            default:
                return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
    };

    const isChangePositive = change !== null && change !== undefined && change >= 0;

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 hover:border-theme-primary transition-colors duration-300 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 text-theme-primary">
                    {icon}
                    <h3 className="text-sm font-medium text-slate-300 whitespace-nowrap">{title}</h3>
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-white truncate">{formatValue()}</p>
                 {children}
            </div>
            
            {change !== null && change !== undefined && Math.abs(change) > 0.01 && (
                <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${isChangePositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isChangePositive ? <TrendUpIcon /> : <TrendDownIcon />}
                    <span>{isChangePositive ? '+' : ''}{change.toFixed(1)}%</span>
                    <span className="text-slate-500 font-normal ml-1">vs last week</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;