import { ResponsiveContainer } from 'recharts';

const ChartFrame = ({ title, empty, children }) => {
  if (empty) {
    return (
      <div className="flex h-64 w-full min-w-0 items-center justify-center text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <h3 className="mb-2 text-center text-sm font-medium text-slate-300">{title}</h3>
      <div className="h-[220px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartFrame;
