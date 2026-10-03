import Header from '../components/layout/Header';
import HealthOverview from '../components/dashboard/HealthOverview';
import SensorCharts from '../components/dashboard/SensorCharts';
import DigitalTwin from '../components/dashboard/DigitalTwin';
import FatiguePrediction from '../components/dashboard/FatiguePrediction';
import AlertsList from '../components/dashboard/AlertsList';

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Health Overview */}
        <HealthOverview />

        {/* Digital Twin + Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DigitalTwin />
          <AlertsList />
        </div>

        {/* Sensor Charts */}
        <SensorCharts />

        {/* Fatigue Prediction */}
        <FatiguePrediction />
      </div>
    </div>
  );
}
