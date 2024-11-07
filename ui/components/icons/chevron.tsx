interface ChevronProps {
  orientation: 'up' | 'down';
  darkness?: 'light' | 'dark';
}

export function Chevron({ orientation, darkness }: ChevronProps) {
  let xScale: number = 1;
  let yScale: number = 1;
  if (orientation === 'up' || orientation === 'down') {
    xScale = 1;
    yScale = orientation === 'up' ? -1 : 1;
  }

  return (
    <svg
      className={`-mx-1 size-5 ${
        darkness === 'light' ? 'text-gray-400' : 'text-gray-800'
      }`}
      viewBox='0 0 20 20'
      fill='currentColor'
      aria-hidden='true'
      data-slot='icon'
      style={`transform: scale(${xScale}, ${yScale})`}
    >
      <path
        fill-rule='evenodd'
        d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z'
        clip-rule='evenodd'
      />
    </svg>
  );
}
