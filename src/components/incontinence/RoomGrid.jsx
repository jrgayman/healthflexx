import React, { useState } from 'react';
import RoomStatus from './RoomStatus';

export default function RoomGrid({ rooms }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showActive, setShowActive] = useState(true);
  const roomsPerPage = 20;
  const roomsPerRow = 5;

  // Filter and paginate rooms
  const filteredRooms = showActive 
    ? rooms.filter(room => room.active)
    : rooms;

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  // Create rows of rooms
  const rows = [];
  for (let i = 0; i < paginatedRooms.length; i += roomsPerRow) {
    rows.push(paginatedRooms.slice(i, i + roomsPerRow));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {showActive ? 'Active Rooms' : 'All Rooms'}
        </h2>
        <button
          onClick={() => setShowActive(!showActive)}
          className="text-primary hover:text-primary-dark"
        >
          {showActive ? 'Show All' : 'Show Active Only'}
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4">
            {row.map((room) => (
              <RoomStatus key={room.id} room={room} />
            ))}
            {/* Fill empty slots in last row */}
            {row.length < roomsPerRow && [...Array(roomsPerRow - row.length)].map((_, i) => (
              <div key={`empty-${i}`} className="h-0"></div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === i + 1
                  ? 'bg-primary text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}