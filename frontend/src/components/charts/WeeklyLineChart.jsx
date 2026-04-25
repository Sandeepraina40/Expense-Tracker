/**
 * WeeklyLineChart Component
 * Renders a line chart showing daily spending trends
 * Displays spending data for the most recent 14 unique days
 * @author Harsh Chimnani
 */
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Number of recent days to display in the chart
const DAYS_TO_SHOW = 14;

// Chart styling constants for dark theme
const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const GRID_STROKE = '#334155';
const AXIS_STROKE = '#94a3b8';
const LINE_COLOR = '#10b981'; // Emerald green for the trend line

const WeeklyLineChart = ({ expenses }) => {
  // Process expenses into daily aggregated data points
  const chartData = useMemo(() => {
    // Sort expenses in ascending date order for chronological display
    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Aggregate amounts by date (day-level granularity)
    const dailyMap = sortedExpenses.reduce((acc, expense) => {
      const dateStr = new Date(expense.date).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });
      acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
      return acc;
    }, {});

    // Take only the most recent N days for a clean visualization
    const allDays = Object.entries(dailyMap);
    const recentDays = allDays.slice(-DAYS_TO_SHOW);

    return recentDays.map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
    }));
  }, [expenses]);

  // Display empty state when no data is available
  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <h3 className="text-center text-sm font-medium text-slate-300 mb-2">
        Daily Spending Trend
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={GRID_STROKE}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={AXIS_STROKE}
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke={AXIS_STROKE}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
            contentStyle={TOOLTIP_STYLE}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={LINE_COLOR}
            strokeWidth={3}
            dot={{ fill: LINE_COLOR, r: 4 }}
            activeDot={{ r: 6, stroke: LINE_COLOR, strokeWidth: 2 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyLineChart;
