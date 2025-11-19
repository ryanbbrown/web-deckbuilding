import { useState } from 'react';
import useGameStore from '../store/game-store';
import Button from '@/ui/button';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function JoinRoomModal({
  isOpen,
  onClose,
  onJoin,
  isLoading,
  error,
}: JoinRoomModalProps) {
  const [roomInput, setRoomInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      void onJoin(roomInput.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg p-4 w-80 shadow-xl border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Join Room</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="Enter room ID"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button text="Cancel" onClick={onClose} disabled={isLoading} />
            <Button
              text={isLoading ? 'Joining...' : 'Join Room'}
              type="submit"
              disabled={isLoading || !roomInput.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-green-500 text-white hover:bg-green-600 border border-green-500 hover:border-green-600 h-10 px-4 py-2"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CompactMultiplayerControls() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomIdToJoin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert to uppercase to match generated room IDs
      const normalizedRoomId = roomIdToJoin.toUpperCase();
      await joinRoom(normalizedRoomId);
      setShowJoinModal(false);
      console.log('Joined room:', normalizedRoomId);
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

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Connection Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1 border rounded-md bg-gray-50 ${isConnected ? 'border-green-500' : 'border-black'}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-black'}`}
          />
          <span className="text-sm font-medium">
            {isConnected && roomId ? `Room ${roomId}` : 'Local Mode'}
          </span>
        </div>

        {/* Action Buttons */}
        {!isConnected ? (
          <>
            <Button
              text="Create Room"
              onClick={() => void handleCreateRoom()}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-500 text-white hover:bg-blue-600 border border-blue-500 hover:border-blue-600 h-10 px-4 py-2"
            />
            <Button
              text="Join Room"
              onClick={() => setShowJoinModal(true)}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-green-500 text-white hover:bg-green-600 border border-green-500 hover:border-green-600 h-10 px-4 py-2"
            />
          </>
        ) : (
          <Button
            text="Leave Room"
            onClick={handleLeaveRoom}
            className="inline-flex items-center justify-center rounded-md text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-red-500 text-white hover:bg-red-600 border border-red-500 hover:border-red-600 h-10 px-4 py-2"
          />
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 max-w-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex">
            <div className="flex-1">
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError(null);
        }}
        onJoin={handleJoinRoom}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
