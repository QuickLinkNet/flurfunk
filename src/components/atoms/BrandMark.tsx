interface Props {
  size?: number;
}

export function BrandMark({ size = 92 }: Props) {
  return (
    <img
      src="/apps/neighborhood/brand/flurfunk-logo-mark.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
  );
}
