'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export const BoltBadge: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:scale-105"
      >
        <Image
          src={theme === 'dark' ? '/white_circle_360x360.png' : '/black_circle_360x360.png'}
          alt="Built with Bolt.new"
          width={48}
          height={48}
          className="rounded-full shadow-lg"
        />
      </a>
    </div>
  );
};