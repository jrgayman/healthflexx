import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export default function RoomStatus({ room }) {
  const getStatusInfo = () => {
    if (!room.status || room.status === 'no_detection') {
      return {
        color: 'bg-[#FF8C00]',
        text: 'No Sensor In Range',
        textColor: 'text-white'
      };
    }
    if (room.status === 'wet') {
      return {
        color: 'bg-[#FF0000]',
        text: 'Wetness Detected',
        textColor: 'text-white'
      };
    }
    return {
      color: 'bg-[#79B6B9]',
      text: 'No Wetness Detected',
      textColor: 'text-white'
    };
  };

  const { color, text, textColor } = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
      </div>
      <div className="p-4">
        {room.users?.length > 0 ? (
          <div className="space-y-2">
            <Link 
              to={`/admin/patient/${room.users[0].id}/rfid`}
              className="text-lg font-medium text-primary hover:text-primary-dark"
            >
              {room.users[0].name}
            </Link>
            <div className={`${color} ${textColor} px-3 py-2 rounded-md text-sm font-medium`}>
              {text}
            </div>
            {room.last_changed && (
              <div className="text-sm text-gray-500">
                Last updated: {formatDistanceToNow(new Date(room.last_changed))} ago
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-lg">Unoccupied</div>
        )}
      </div>
    </div>
  );
}