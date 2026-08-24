import * as React from "react";

/*
 * Ikon authored dunia "Buku Kas": goresan tinta tunggal, ujung persegi
 * seperti tarikan pena, tanpa fill. Satu keluarga stroke 1.75.
 */

type IconProps = React.ComponentProps<"svg">;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9.2 6 5.8 6-5.8" />
    </IconBase>
  );
}

function ChevronUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 14.8 6-5.8 6 5.8" />
    </IconBase>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12.5 4.6 4.5L19 7" />
    </IconBase>
  );
}

function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" />
    </IconBase>
  );
}

function CircleCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="m8.4 12.3 2.5 2.5 4.7-5.2" />
    </IconBase>
  );
}

function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 11.2v5" />
      <path d="M12 7.8h.01" />
    </IconBase>
  );
}

function TriangleAlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.2 2.9 19.6h18.2Z" />
      <path d="M12 10.2v4.2" />
      <path d="M12 17.2h.01" />
    </IconBase>
  );
}

function OctagonXIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.2 3.2h7.6l5 5v7.6l-5 5H8.2l-5-5V8.2Z" />
      <path d="m9.4 9.4 5.2 5.2M14.6 9.4l-5.2 5.2" />
    </IconBase>
  );
}

function Loader2Icon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8" />
    </IconBase>
  );
}

/* Panah indeks: tarikan tangan sedikit miring, khas coretan di buku. */
function ArrowLedgerIcon(props: IconProps) {
  return (
    <IconBase strokeWidth={1.5} {...props}>
      <path d="M4 12.4c4.9-.6 9.7-.6 14.6-.2" />
      <path d="m15.2 8.9 4.5 3.3-4.8 3.2" />
    </IconBase>
  );
}

export {
  ArrowLedgerIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
};
