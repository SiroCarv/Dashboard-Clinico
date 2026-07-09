import BarraSuperior from '../../../shared/components/BarraSuperior';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <BarraSuperior titulo="Panel de Administración (Psicólogo)" />
      <div className="p-10">
        {/* contenido del dashboard */}
      </div>
    </div>
  );
}