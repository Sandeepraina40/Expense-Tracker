/**
 * ExpenseFilter Component
 * Provides category and date range filtering controls
 * Allows users to narrow down expense view by category and time period
 * @author Harsh Chimnani
 */
import { useCallback } from 'react';
import { Filter, Calendar, Tag } from 'lucide-react';

// Available filter categories including 'All' for no filtering
const FILTER_CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Other',
];

const ExpenseFilter = ({ filterCategory, setFilterCategory, dateRange, setDateRange }) => {

  // Handle category selection change
  const handleCategoryChange = useCallback((e) => {
    setFilterCategory(e.target.value);
  }, [setFilterCategory]);

  // Handle start date change
  const handleStartDateChange = useCallback((e) => {
    setDateRange(prevRange => ({ ...prevRange, start: e.target.value }));
  }, [setDateRange]);

  // Handle end date change
  const handleEndDateChange = useCallback((e) => {
    setDateRange(prevRange => ({ ...prevRange, end: e.target.value }));
  }, [setDateRange]);

  // Clear all filters and reset to default state
  const clearFilters = useCallback(() => {
    setFilterCategory('All');
    setDateRange({ start: '', end: '' });
  }, [setFilterCategory, setDateRange]);

  // Check if any filter is currently active
  const hasActiveFilters = filterCategory !== 'All' || dateRange.start || dateRange.end;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Filter className="h-5 w-5 text-blue-400" />
          Advanced Filters
        </div>
        {/* Clear Filters Button - Visible only when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter Dropdown */}
      <div className="space-y-1.5 w-full">
        <label htmlFor="filter-category" className="text-xs font-medium text-slate-400 ml-1 flex items-center gap-1.5">
          <Tag className="h-3 w-3" />
          Category
        </label>
        <select
          id="filter-category"
          className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none h-[44px] leading-none m-0"
          value={filterCategory}
          onChange={handleCategoryChange}
          style={{ colorScheme: 'dark' }}
        >
          {FILTER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-slate-800">
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter Section */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label htmlFor="filter-date-start" className="text-xs font-medium text-slate-400 ml-1 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            From
          </label>
          <input
            id="filter-date-start"
            type="date"
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none h-[44px] leading-none m-0"
            value={dateRange.start}
            onChange={handleStartDateChange}
            max={dateRange.end || undefined}
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label htmlFor="filter-date-end" className="text-xs font-medium text-slate-400 ml-1 flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            To
          </label>
          <input
            id="filter-date-end"
            type="date"
            className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2.5 text-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none h-[44px] leading-none m-0"
            value={dateRange.end}
            onChange={handleEndDateChange}
            min={dateRange.start || undefined}
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilter;
