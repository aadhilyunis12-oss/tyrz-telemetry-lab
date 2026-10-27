'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setStatus('AUTHENTICATING WITH F40 TELEMETRY SERVER...');
    setTimeout(() => {
      setStatus('SYNCHRONIZING MONGODB DATABASE...');
    }, 800);
    setTimeout(() => {
      setStatus('SUCCESS! REDIRECTING TO AI SCANNER...');
      window.location.href = '/';
    }, 1800);
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', background: '#040507',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', color: '#fff', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', background: 'rgba(10, 12, 16, 0.85)',
        border: '1px solid rgba(230, 0, 0, 0.4)', borderRadius: '24px',
        padding: '36px', backdropFilter: 'blur(16px)'
      }}>
        <Link href="/" style={{ color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textDecoration: 'none', fontWeight: 600 }}>
          ← BACK TO AI SCANNER LANDING PAGE
        </Link>

        <h1 style={{ fontSize: '1.8rem', margin: '20px 0 6px', fontFamily: 'var(--font-mono)' }}>
          TYRZ <span style={{ color: 'var(--accent)' }}>LAB PORTAL</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '24px' }}>
          Enter pilot credentials to unlock tyre telemetry diagnostics.
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '6px' }}>USERNAME / EMAIL</label>
            <input
              type="text" required value={username} onChange={e => setUsername(e.target.value)}
              placeholder="pilot@f40.it"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', borderRadius: '10px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '6px' }}>PASSWORD</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', borderRadius: '10px', outline: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            LOGIN TO PORTAL ➔
          </button>
        </form>

        {status && (
          <div style={{ marginTop: '16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)', textAlign: 'center' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
