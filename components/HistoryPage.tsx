import React, { useState, useMemo, Fragment } from 'react';
import { GameState, Transaction } from '../types';
import { MONTH_NAMES } from '../constants';
import { ChevronDownIcon, HistoryIcon } from './Icons';

interface HistoryPageProps {
    gameState: GameState;
}

interface WeeklySummary {
    turn: number;
    week: number;
    month: number;
    year: number;
    totalDeposits: number;
    totalLoans: number;
    totalIncome: number;
    totalExpenses: number;
    netOutcome: number;
}

interface GroupedWeek {
    summary: WeeklySummary;
    transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

const getTypeCellStyle = (type: Transaction['type']) => {
    switch(type) {
        case 'INCOME': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'DEPOSIT': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        case 'LOAN_REPAYMENT': return 'bg-green-500/10 text-green-400 border-green-500/20';
        case 'EXPENSE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'INVESTMENT': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'MARKETING_CAMPAIGN': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'LOAN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'PENALTY': return 'bg-red-500/10 text-red-400 border-red-500/20';
        case 'LOAN_DEFAULT': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        default: return 'bg-slate-600/20 text-slate-300 border-slate-600/30';
    }
}

const HistoryPage: React.FC<HistoryPageProps> = ({ gameState }) => {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: keyof WeeklySummary; direction: 'asc' | 'desc' }>({ key: 'turn', direction: 'desc' });

    const weeklySummaries: GroupedWeek[] = useMemo(() => {
        const groupedByWeek: { [key: string]: { transactions: Transaction[], summary: Partial<WeeklySummary> & { turn: number } } } = {};

        gameState.transactions.forEach(tx => {
            const weekKey = `${tx.year}-${tx.month}-${tx.week}`;
            if (!groupedByWeek[weekKey]) {
                groupedByWeek[weekKey] = {
                    transactions: [],
                    summary: {
                        turn: tx.turn,
                        week: tx.week,
                        month: tx.month,
                        year: tx.year,
                        totalDeposits: 0,
                        totalLoans: 0,
                        totalIncome: 0,
                        totalExpenses: 0,
                    }
                };
            }
            groupedByWeek[weekKey].transactions.push(tx);

            switch (tx.type) {
                case 'DEPOSIT':
                    groupedByWeek[weekKey].summary.totalDeposits! += tx.amount;
                    break;
                case 'LOAN':
                    groupedByWeek[weekKey].summary.totalLoans! += tx.amount;
                    break;
                case 'INCOME':
                case 'LOAN_REPAYMENT':
                    groupedByWeek[weekKey].summary.totalIncome! += tx.amount;
                    break;
                case 'EXPENSE':
                case 'INVESTMENT':
                case 'PENALTY':
                case 'MARKETING_CAMPAIGN':
                case 'LOAN_DEFAULT':
                    groupedByWeek[weekKey].summary.totalExpenses! += Math.abs(tx.amount);
                    break;
            }
        });

        return Object.values(groupedByWeek).map(group => {
            const netOutcome = group.summary.totalIncome! - group.summary.totalExpenses!;
            return {
                transactions: group.transactions,
                summary: {
                    ...group.summary as WeeklySummary,
                    netOutcome
                }
            };
        });
    }, [gameState.transactions]);
    
    const sortedSummaries = useMemo(() => {
        let sortableItems = [...weeklySummaries];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a.summary[sortConfig.key] < b.summary[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a.summary[sortConfig.key] > b.summary[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [weeklySummaries, sortConfig]);

    const requestSort = (key: keyof WeeklySummary) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleRow = (turn: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(turn)) {
                newSet.delete(turn);
            } else {
                newSet.add(turn);
            }
            return newSet;
        });
    };
    
    const getSortIndicator = (key: keyof WeeklySummary) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-700 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <HistoryIcon className="w-7 h-7 text-theme-primary"/>
                Weekly Financial Summary
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-theme-primary uppercase bg-slate-800">
                        <tr>
                            <th scope="col" className="px-1 py-3"></th>
                            <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort('turn')}>
                                Date {getSortIndicator('turn')}
                            </th>
                            <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('totalDeposits')}>
                                Deposits {getSortIndicator('totalDeposits')}
                            </th>
                            <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('totalLoans')}>
                                Loans Issued {getSortIndicator('totalLoans')}
                            </th>
                            <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('totalIncome')}>
                                Total Income {getSortIndicator('totalIncome')}
                            </th>
                            <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('totalExpenses')}>
                                Total Expenses {getSortIndicator('totalExpenses')}
                            </th>
                            <th scope="col" className="px-4 py-3 cursor-pointer text-right" onClick={() => requestSort('netOutcome')}>
                                Net Weekly Outcome {getSortIndicator('netOutcome')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSummaries.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-500">No transactions yet. Advance to the next week to see activity.</td>
                            </tr>
                        ) : (
                            sortedSummaries.map(({ summary, transactions }) => {
                                const isExpanded = expandedRows.has(summary.turn);
                                return (
                                    <Fragment key={summary.turn}>
                                        <tr className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer" onClick={() => toggleRow(summary.turn)}>
                                            <td className="px-1 py-4 text-center">
                                                <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </td>
                                            <td className="px-4 py-4 font-medium text-slate-400 whitespace-nowrap">
                                                Wk {summary.week}, {MONTH_NAMES[summary.month - 1].substring(0,3)} {summary.year}
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-sky-400">{formatCurrency(summary.totalDeposits)}</td>
                                            <td className="px-4 py-4 text-right font-mono text-blue-400">{formatCurrency(summary.totalLoans)}</td>
                                            <td className="px-4 py-4 text-right font-mono text-emerald-400">{formatCurrency(summary.totalIncome)}</td>
                                            <td className="px-4 py-4 text-right font-mono text-amber-400">{formatCurrency(summary.totalExpenses)}</td>
                                            <td className={`px-4 py-4 text-right font-mono font-bold ${summary.netOutcome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {summary.netOutcome >= 0 ? '+' : ''}{formatCurrency(summary.netOutcome)}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-800/20">
                                                <td colSpan={7} className="p-0">
                                                    <div className="p-4">
                                                        <h4 className="font-bold text-slate-300 mb-2">Detailed Transactions for Week {summary.week}, {MONTH_NAMES[summary.month - 1]}</h4>
                                                        <table className="w-full text-xs">
                                                            <tbody>
                                                                {transactions.sort((a,b) => a.type.localeCompare(b.type)).map(tx => (
                                                                    <tr key={tx.id} className="border-b border-slate-700/50 last:border-b-0">
                                                                        <td className="py-2 pr-4">{tx.description}</td>
                                                                        <td className="py-2 px-4">
                                                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getTypeCellStyle(tx.type)}`}>
                                                                                {tx.type.replace(/_/g, ' ')}
                                                                            </span>
                                                                        </td>
                                                                        <td className={`py-2 pl-4 text-right font-mono ${tx.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .text-theme-primary {
                    color: var(--theme-primary);
                }
            `}</style>
        </div>
    );
};

export default HistoryPage;
