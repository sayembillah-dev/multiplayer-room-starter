'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { newRoomId } from '@/lib/roomId';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const createRoom = () => {
    router.push(`/room/${newRoomId()}`);
  };

  const joinByCode = (e) => {
    e.preventDefault();
    const raw = code.trim().toLowerCase();
    const match = raw.match(/\/room\/([a-z0-9]+)/); // accepts a full pasted URL too
    const id = (match ? match[1] : raw).replace(/[^a-z0-9]/g, '');
    if (id.length >= 4) router.push(`/room/${id}`);
  };

  return (
    <main className="container">
      <div className="card hero">
        {/* TODO: rename your game */}
        <h1 className="logo">🎮 my-game</h1>
        <p className="tagline">
          Create a room, share the link, and your friends join instantly.
          <br />
          Real-time. No accounts.
        </p>

        <button className="btn btn-primary btn-lg" onClick={createRoom}>
          🎲 Create a room
        </button>

        <div className="divider">
          <span>or join with a link / code</span>
        </div>

        <form onSubmit={joinByCode} className="join-form">
          <input
            className="input"
            placeholder="Paste room link or code…"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
          />
          <button className="btn" type="submit" disabled={code.trim().length < 4}>
            Join →
          </button>
        </form>
      </div>
    </main>
  );
}
