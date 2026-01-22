import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TelemetryData } from '@/hooks/useTelemetry';

interface PowerChartProps {
  data: TelemetryData[];
  title: string;
}

export function PowerChart({ data, title }: PowerChartProps) {
  const chartData = data.slice(-30).map((d, i) => ({
    time: i,
    power: d.powerOutputKw,
    irradiance: d.solarIrradiance / 10, // Scale for visualization
    temp: d.temperaturePanel,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-4 md:p-6"
    >
      <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h3>
      
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="irradianceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(217 33% 20%)" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="time" 
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(217 33% 20%)' }}
              tickLine={false}
            />
            
            <YAxis 
              tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(217 33% 20%)' }}
              tickLine={false}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 8%)',
                border: '1px solid hsl(217 33% 20%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(215 20% 65%)' }}
              itemStyle={{ color: 'hsl(210 40% 98%)' }}
            />
            
            <Area
              type="monotone"
              dataKey="irradiance"
              stroke="hsl(38 92% 50%)"
              strokeWidth={1}
              fill="url(#irradianceGradient)"
              name="Irradiance (/10)"
            />
            
            <Area
              type="monotone"
              dataKey="power"
              stroke="hsl(160 84% 39%)"
              strokeWidth={2}
              fill="url(#powerGradient)"
              name="Power (kW)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary rounded" />
          <span className="text-muted-foreground">Power Output</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-warning rounded" />
          <span className="text-muted-foreground">Solar Irradiance</span>
        </div>
      </div>
    </motion.div>
  );
}
