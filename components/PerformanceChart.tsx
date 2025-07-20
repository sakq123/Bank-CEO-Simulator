import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HistoryEntry } from '../types';
import { MONTH_NAMES } from '../constants';

interface PerformanceChartProps {
    history: HistoryEntry[];
    themeColor: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    if (!entry) return null;
    return (
      <div className="p-2 bg-slate-700 border border-slate-600 rounded-md shadow-lg text-sm">
        <p className="label font-bold text-white">{`Week ${entry.week}, ${MONTH_NAMES[entry.month - 1]} ${entry.year}`}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {`${p.name}: ${p.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function to calculate Simple Moving Average
const calculateSMA = (data: number[], windowSize: number): (number | null)[] => {
    let sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < windowSize - 1) {
            sma.push(data[i]); // Use raw data until the window is full
        } else {
            const window = data.slice(i - windowSize + 1, i + 1);
            const sum = window.reduce((a, b) => a + b, 0);
            sma.push(sum / windowSize);
        }
    }
    return sma;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ history, themeColor }) => {
    const [timeWindow, setTimeWindow] = useState<'all' | 'recent'>('all');
    const SMA_WINDOW = 3;
    const RECENT_WINDOW = 12;

    const processedData = useMemo(() => {
        if (history.length < 1) return [];

        let dataToProcess = history;

        if (timeWindow === 'recent') {
            return history.slice(-RECENT_WINDOW); // Return raw recent data
        }

        // else, it's 'all', so we smooth it
        const cashValues = dataToProcess.map(h => h.cash);
        const loansValues = dataToProcess.map(h => h.loans);
        const depositsValues = dataToProcess.map(h => h.deposits);
        const netOutcomeValues = dataToProcess.map(h => h.netOutcome);

        const smoothedCash = calculateSMA(cashValues, SMA_WINDOW);
        const smoothedLoans = calculateSMA(loansValues, SMA_WINDOW);
        const smoothedDeposits = calculateSMA(depositsValues, SMA_WINDOW);
        const smoothedNetOutcome = calculateSMA(netOutcomeValues, SMA_WINDOW);

        return dataToProcess.map((entry, index) => ({
            ...entry,
            cash: smoothedCash[index],
            loans: smoothedLoans[index],
            deposits: smoothedDeposits[index],
            netOutcome: smoothedNetOutcome[index],
        }));
    }, [history, timeWindow]);
    
    if (processedData.length < 2) {
        return (
             <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-80 flex items-center justify-center">
                <p className="text-slate-400">Financial chart will appear here after data stabilizes (min. 2 weeks).</p>
            </div>
        )
    }

    const formatXAxis = (tick: number) => {
        const entry = processedData.find(d => d.turn === tick);
        if (!entry) return '';
        const monthAbbr = MONTH_NAMES[entry.month - 1].substring(0, 3);
        const yearAbbr = entry.year.toString().substring(2);

        if (timeWindow === 'recent') {
             return `W${entry.week}`;
        }

        // Only show a label at the start of a month for 'All Time' view to prevent clutter
        if (entry.week === 1) {
            return `${monthAbbr} '${yearAbbr}`;
        }
        return '';
    };

    const chartTitle = timeWindow === 'all' 
        ? "Financial Performance (All Time, 3-Week Avg)" 
        : "Financial Performance (Last 12 Weeks)";
    
    const legendSuffix = timeWindow === 'all' ? ' (Avg)' : '';

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-80 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{chartTitle}</h3>
                <div className="bg-slate-900 p-1 rounded-lg flex gap-1 text-xs">
                    <button 
                        onClick={() => setTimeWindow('all')} 
                        className={`px-3 py-1 rounded-md transition-colors ${timeWindow === 'all' ? 'active-toggle' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        All Time
                    </button>
                    <button 
                        onClick={() => setTimeWindow('recent')} 
                        className={`px-3 py-1 rounded-md transition-colors ${timeWindow === 'recent' ? 'active-toggle' : 'text-slate-400 hover:bg-slate-700'}`}
                    >
                        Last 12 Weeks
                    </button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={processedData} margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="1 4" stroke="#475569" strokeOpacity={0.5} />
                    <XAxis 
                        dataKey="turn" 
                        tickFormatter={formatXAxis}
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        interval={timeWindow === 'recent' ? 1 : 3}
                        padding={{ left: 20, right: 20 }}
                    />
                    <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        domain={['auto', 'auto']}
                        width={80}
                    />
                     <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        tick={{ fill: '#f59e0b', fontSize: 12 }}
                        domain={['auto', 'auto']}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize: "14px", marginTop: "10px"}} />
                    
                    <Line yAxisId="left" type="monotone" dataKey="cash" stroke={themeColor} strokeWidth={3} dot={false} name={`Cash${legendSuffix}`} />
                    <Line yAxisId="left" type="monotone" dataKey="loans" stroke="#38bdf8" strokeWidth={2} dot={false} name={`Loans${legendSuffix}`} />
                    <Line yAxisId="left" type="monotone" dataKey="deposits" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="5 5" name={`Deposits${legendSuffix}`} />
                    <Line yAxisId="right" type="monotone" dataKey="netOutcome" stroke="#f59e0b" strokeWidth={2} dot={false} name={`Net Outcome${legendSuffix}`} />
                </LineChart>
            </ResponsiveContainer>
             <style>{`
                .active-toggle {
                    background-color: var(--theme-primary);
                    color: var(--theme-text-on-primary);
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default React.memo(PerformanceChart);