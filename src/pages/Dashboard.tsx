import { useState, useCallback } from 'react';
import { Zap, Droplets, Leaf, TrendingUp, Sun, Thermometer } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PowerChart } from '@/components/dashboard/PowerChart';
import { EfficiencyGauge } from '@/components/dashboard/EfficiencyGauge';
import { CanalMap } from '@/components/dashboard/CanalMap';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { MaintenanceAlert, MaintenanceIssue } from '@/components/dashboard/MaintenanceAlert';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Dashboard() {
  const { telemetry, metrics, historicalData } = useTelemetry();
  const { isAdmin } = useAuth();
  
  const [maintenanceIssues, setMaintenanceIssues] = useState<MaintenanceIssue[]>([
    {
      id: '1',
      type: 'dust',
      severity: 'medium',
      station: 'Station A - Panel Array 3',
      message: 'Dust accumulation detected. Power output 8% below expected for current irradiance.',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'silt',
      severity: 'high',
      station: 'Canal Section B',
      message: 'High silt levels detected. May affect water cooling efficiency.',
      timestamp: new Date(Date.now() - 300000),
    },
  ]);

  const handleDismiss = useCallback((id: string) => {
    setMaintenanceIssues(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleAction = useCallback((id: string, action: string) => {
    toast.success(`${action} command sent for issue ${id}`);
    handleDismiss(id);
  }, [handleDismiss]);

  const handleCommand = useCallback((command: string) => {
    console.log('Command executed:', command);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header />
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <MetricCard
            title="Power Output"
            value={telemetry.powerOutputKw}
            unit="kW"
            icon={Zap}
            variant="power"
            pulse
            trend="up"
            trendValue="+5.2%"
          />
          <MetricCard
            title="Water Saved"
            value={metrics.waterSavedLiters}
            unit="L"
            icon={Droplets}
            variant="water"
            pulse
            subtitle="Today's total"
          />
          <MetricCard
            title="Total Energy"
            value={metrics.totalEnergyKwh}
            unit="kWh"
            icon={Sun}
            variant="power"
          />
          <MetricCard
            title="CO₂ Offset"
            value={metrics.co2OffsetKg}
            unit="kg"
            icon={Leaf}
            variant="default"
            trend="up"
          />
          <MetricCard
            title="Efficiency Gain"
            value={`+${metrics.efficiencyDelta.toFixed(1)}`}
            unit="%"
            icon={TrendingUp}
            variant="power"
          />
          <MetricCard
            title="Panel Temp"
            value={telemetry.temperaturePanel}
            unit="°C"
            icon={Thermometer}
            variant={telemetry.temperaturePanel > 50 ? 'warning' : 'default'}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <PowerChart data={historicalData} title="Real-Time Power Generation" />
            <CanalMap />
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <EfficiencyGauge
              efficiencyDelta={metrics.efficiencyDelta}
              panelTemp={telemetry.temperaturePanel}
              waterTemp={telemetry.waterTemp}
              coolingBenefit={metrics.panelCoolingBenefit}
            />
            <MaintenanceAlert
              issues={maintenanceIssues}
              onDismiss={handleDismiss}
              onAction={handleAction}
              isAdmin={isAdmin}
            />
            <ControlPanel isAdmin={isAdmin} onCommand={handleCommand} />
          </div>
        </div>
      </div>
    </div>
  );
}
