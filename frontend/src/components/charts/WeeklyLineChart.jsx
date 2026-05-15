import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartFrame from './ChartFrame';

const DAYS_TO_SHOW = 14;

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '13px',
};

const GRID_STROKE = '#334155';
const AXIS_STROKE = '#94a3b8';
const LINE_COLOR = '#10b981';

const WeeklyLineChart = ({ expenses }) => {
  const chartData = useMemo(() => {
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    const dailyMap = sortedExpenses.reduce((acc, expense) => {
      const dateStr = new Date(expense.date).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });
      acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
      return acc;
    }, {});

    return Object.entries(dailyMap)
      .slice(-DAYS_TO_SHOW)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }));
  }, [expenses]);

  return (
    <ChartFrame title="Daily Spending Trend" empty={chartData.length === 0}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" stroke={AXIS_STROKE} fontSize={12} tickLine={false} />
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
    </ChartFrame>
  );
};

export default WeeklyLineChart;
