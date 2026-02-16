import { type SVGProps } from "react";

type AppIconProps = SVGProps<SVGSVGElement>;

function iconProps(props: AppIconProps): AppIconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export function HomeIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m3 11 9-7 9 7" />
      <path d="M6 10v10h12V10" />
    </svg>
  );
}

export function SearchIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function OrdersIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

export function WalletIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 8h15a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <path d="M3 8V7a2 2 0 0 1 2-2h12" />
      <circle cx="16.5" cy="13.5" r="1.5" />
    </svg>
  );
}

export function ProfileIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function SupportIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20 11.5a8 8 0 1 0-16 0v3.5a2 2 0 0 0 2 2h2v-5H4.1" />
      <path d="M19.9 12H16v5h2a2 2 0 0 0 2-2V12Z" />
      <path d="M12 20v1.5" />
    </svg>
  );
}

export function AddressIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function NotificationIcon(props: AppIconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M15 18H5l2-2v-5a5 5 0 1 1 10 0v5l2 2h-4" />
      <path d="M10.8 20a1.2 1.2 0 0 0 2.4 0" />
    </svg>
  );
}
