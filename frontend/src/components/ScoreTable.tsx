import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { IndustryScore } from '../types';

interface ScoreTableProps {
  data: IndustryScore[];
}

type SortField = keyof IndustryScore;
type SortDirection = 'asc' | 'desc';

export default function ScoreTable({ data }: ScoreTableProps) {
  const [sortField, setSortField] = useState<SortField>('finalRAUIS');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-accent-blue" />
      : <ArrowDown className="w-4 h-4 text-accent-blue" />;
  };

  const getRauisColor = (score: number) => {
    if (score >= 90) return 'text-accent-green';
    if (score >= 80) return 'text-accent-blue';
    if (score >= 70) return 'text-accent-amber';
    return 'text-accent-red';
  };

  return (
    <div className="bg-dark-card rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Industry RAUIS Score Breakdown</h2>
        <p className="text-sm text-gray-300 mt-1">Risk-Adjusted Unicorn Investment Score analysis</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th 
                onClick={() => handleSort('industry')}
                className="text-left px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>Industry</span>
                  <SortIcon field="industry" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('baseScore')}
                className="text-right px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Base Score</span>
                  <SortIcon field="baseScore" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('risk')}
                className="text-right px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Risk</span>
                  <SortIcon field="risk" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('saturation')}
                className="text-right px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Saturation</span>
                  <SortIcon field="saturation" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('multiplier')}
                className="text-right px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Multiplier</span>
                  <SortIcon field="multiplier" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('finalRAUIS')}
                className="text-right px-6 py-4 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-[#3F3F46] transition-colors"
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Final RAUIS</span>
                  <SortIcon field="finalRAUIS" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr 
                key={index}
                className="border-b border-gray-800 hover:bg-[#3F3F46]/50 transition-colors"
              >
                <td className="px-6 py-4 text-white font-medium">{row.industry}</td>
                <td className="px-6 py-4 text-right text-gray-300">{row.baseScore}</td>
                <td className="px-6 py-4 text-right">
                  <span className={row.risk > 30 ? 'text-accent-red' : row.risk > 20 ? 'text-accent-amber' : 'text-accent-green'}>
                    {row.risk}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={row.saturation > 70 ? 'text-accent-red' : row.saturation > 50 ? 'text-accent-amber' : 'text-accent-green'}>
                    {row.saturation}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-300">{row.multiplier}x</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-lg font-bold ${getRauisColor(row.finalRAUIS)}`}>
                    {row.finalRAUIS}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
