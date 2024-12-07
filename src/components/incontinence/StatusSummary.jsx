export default function StatusSummary({ rooms }) {
  const stats = rooms.reduce((acc, room) => {
    if (!room.patient_name) return acc;
    
    if (!room.status || room.status === 'no_detection') {
      acc.noDetection++;
    } else if (room.status === 'wet') {
      acc.wet++;
    } else {
      acc.dry++;
    }
    
    return acc;
  }, {
    wet: 0,
    dry: 0,
    noDetection: 0
  });

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-[#79B6B9] rounded-lg p-6 text-white">
        <div className="text-3xl font-bold mb-1">{stats.dry}</div>
        <div className="text-lg">No Wetness Detected</div>
      </div>
      <div className="bg-[#FF0000] rounded-lg p-6 text-white">
        <div className="text-3xl font-bold mb-1">{stats.wet}</div>
        <div className="text-lg">Wetness Detected</div>
      </div>
      <div className="bg-[#FF8C00] rounded-lg p-6 text-white">
        <div className="text-3xl font-bold mb-1">{stats.noDetection}</div>
        <div className="text-lg">No Sensor In Range</div>
      </div>
    </div>
  );
}