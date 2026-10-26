import React from 'react';
import { Music2, Activity, Mic2, Clapperboard, PenLine, AudioLines } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import type { WorkspaceClub } from '../../utils/clubWorkspace';

export function ClubAvatar({ club, size = 48 }: { club: WorkspaceClub; size?: number }) {
  const { theme } = useThemeStore();
  const Icon =
    club.id === 'rhythm'
      ? AudioLines
      : club.category === 'Music'
      ? Music2
      : club.category === 'Dance'
      ? Activity
      : club.category === 'Film'
      ? Clapperboard
      : club.category === 'Writing'
      ? PenLine
      : Mic2;

  return (
    <span
      className="cw-avatar"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.27),
        background: club.color,
        color: '#fff',
        border: `2px solid ${theme.isDark ? (theme.cardBg || '#1e1e24') : '#ffffff'}`,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 2px 7px #14151916',
      }}
    >
      {club.logoUrl ? (
        <img
          src={club.logoUrl}
          alt={`${club.name} logo`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Icon size={size * 0.46} strokeWidth={1.8} />
      )}
    </span>
  );
}

export async function clubImage(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error('Choose JPG, PNG or WebP under 5 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (img.width * img.height > 25000000) throw new Error('Choose an image under 25 megapixels.');
    const scale = Math.min(1, 720 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image preview unavailable.');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/webp', 0.76);
    if (data.length > 400000)
      throw new Error('Choose a smaller image for the local preview.');
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
