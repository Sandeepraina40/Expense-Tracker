/**
 * MonthlyBarChart Component
 * Displays a bar chart of monthly expense totals
 * Helps users visualize spending patterns across months
 * @author Harsh Chimnani
 */
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom tooltip styling for dark theme consistency
const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

// Chart grid styling
const GRID_STROKE = '#334155';
const AXIS_STROKE = '#94a3b8';

const MonthlyBarChart = ({ expenses }) => {
  // Aggregate expenses by month and sort chronologically
  const chartData = useMemo(() => {
    // Create a map of month-year to total amounts
    const monthlyMap = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
      return acc;
    }, {});

    // Convert to array and reverse for chronological order
    return Object.entries(monthlyMap)
      .map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .reverse();
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
        Monthly Expenses
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={GRID_STROKE}
            vertical={false}
          />
          <XAxis
            dataKey="name"
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
            cursor={{ fill: GRID_STROKE, opacity: 0.4 }}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar
            dataKey="amount"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
