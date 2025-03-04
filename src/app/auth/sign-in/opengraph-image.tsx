// src/app/auth/sign-in/opengraph-image.tsx
import React from 'react';
import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Sign in to Documentary Credit Generator';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: '20px' }}>
          Documentary Credit Generator
        </div>
        <div style={{ fontSize: 48, color: '#3b82f6' }}>Sign In</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
