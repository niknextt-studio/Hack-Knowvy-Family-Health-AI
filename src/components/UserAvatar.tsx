import React, { useState } from 'react';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeClasses: Record<string, string> = {
  xs: 'w-4 h-4 text-[10px]',
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
  '2xl': 'w-14 h-14 text-xl',
  '3xl': 'w-16 h-16 text-2xl',
};

export const isAvatarUrl = (avatar?: string): boolean => {
  if (!avatar) return false;
  return (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('/') ||
    avatar.startsWith('data:')
  );
};

export const formatMemberOptionLabel = (m: {
  avatar?: string;
  name: string;
  relationship?: string;
  age?: number;
}): string => {
  const emoji = !isAvatarUrl(m.avatar) && m.avatar ? `${m.avatar} ` : '';
  const extra =
    m.relationship || m.age
      ? ` (${m.relationship || ''}${m.relationship && m.age ? ', ' : ''}${m.age ? `${m.age}y` : ''})`
      : '';
  return `${emoji}${m.name}${extra}`;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'User',
  className = '',
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatar && isAvatarUrl(avatar) && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  // If it's an emoji (short string without http)
  const isEmoji = avatar && !isAvatarUrl(avatar) && avatar.length <= 6;
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-bold select-none ${
        isEmoji ? '' : 'bg-teal-100 text-teal-800'
      } ${sizeClass} ${className}`}
    >
      {isEmoji ? avatar : initial}
    </span>
  );
};
