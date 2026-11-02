import { initials } from '@/lib/image';

export function Avatar({ user, size = 36, className = '' }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (user?.avatar) {
    return <img src={user.avatar} alt={`${user.name} profile photo`} className={`avatar ${className}`} style={style} />;
  }
  return (
    <span className={`avatar avatar-initials ${className}`} style={style} aria-hidden="true">
      {initials(user?.name)}
    </span>
  );
}
