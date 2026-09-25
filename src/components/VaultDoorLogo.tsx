type VaultDoorLogoProps = {
  className?: string;
};

export function VaultDoorLogo({ className = "" }: VaultDoorLogoProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Vault door logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vault-metal" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.92" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="vault-door" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <rect x="12" y="12" width="72" height="72" rx="18" fill="url(#vault-door)" opacity="0.15" />

      <rect x="18" y="20" width="60" height="56" rx="14" fill="url(#vault-door)" stroke="url(#vault-metal)" strokeWidth="3.5" />
      <path d="M30 48h36" stroke="url(#vault-metal)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M34 34v14m28-14v14" stroke="url(#vault-metal)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />

      <circle cx="48" cy="48" r="11" fill="#0b1220" stroke="url(#vault-metal)" strokeWidth="3" />
      <circle cx="48" cy="48" r="3.7" fill="currentColor" opacity="0.95" />
      <path d="M48 37v5m0 12v5M37 48h5m12 0h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />

      <path d="M32 66h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M42 22v-6m12 6v-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
