import { useState } from 'react';
import useGameStore from '../store/game-store';

export default function MultiplayerControls() {
  const [roomInput, setRoomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { roomId, isConnected, createRoom, joinRoom, leaveRoom } =
    useGameStore();

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newRoomId = await createRoom();
      console.log('Created room:', newRoomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await joinRoom(roomInput.trim());
      setRoomInput('');
      console.log('Joined room:', roomInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setError(null);
  };

  const copyRoomId = () => {
    if (roomId) {
      void navigator.clipboard.writeText(roomId);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Multiplayer</h3>

      {/* Connection Status */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isConnected ? '🟢 Connected' : '⚫ Local Mode'}
        </span>

        {roomId && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Room ID: </span>
            <button
              className="text-sm bg-gray-200 px-2 py-1 rounded cursor-pointer hover:bg-gray-300 font-mono"
              onClick={copyRoomId}
              title="Click to copy"
              type="button"
            >
              {roomId}
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      {!isConnected ? (
        <div className="space-y-3">
          {/* Create Room */}
          <button
            onClick={() => void handleCreateRoom()}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
          >
            {isLoading ? 'Creating...' : 'Create New Room'}
          </button>

          {/* Join Room */}
          <div className="flex gap-2">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter room ID"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={() => void handleJoinRoom()}
              disabled={isLoading || !roomInput.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      ) : (
        /* Leave Room */
        <button
          onClick={handleLeaveRoom}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
        >
          Leave Room
        </button>
      )}
    </div>
  );
}
