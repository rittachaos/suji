type IconProps = {
  selected: boolean;
};

function createStroke(color: string) {
  return `2.2px solid ${color}`;
}

export const tabBarIconMap = {
  home: ({ selected }: IconProps) => ({
    wrapper: {
      position: 'relative',
      width: selected ? '26px' : '22px',
      height: selected ? '22px' : '18px',
    },
    roof: {
      position: 'absolute',
      left: '6px',
      top: '2px',
      width: selected ? '12px' : '10px',
      height: selected ? '12px' : '10px',
      borderLeft: createStroke(selected ? '#157AFF' : '#95A3B8'),
      borderTop: createStroke(selected ? '#157AFF' : '#95A3B8'),
      transform: 'rotate(45deg)',
      borderTopLeftRadius: '3px',
    },
    body: {
      position: 'absolute',
      left: '6px',
      bottom: '2px',
      width: selected ? '14px' : '12px',
      height: selected ? '10px' : '8px',
      border: createStroke(selected ? '#157AFF' : '#95A3B8'),
      borderTop: 'none',
      borderBottomLeftRadius: '5px',
      borderBottomRightRadius: '5px',
    },
  }),
  record: ({ selected }: IconProps) => ({
    capsule: {
      width: selected ? '24px' : '20px',
      height: selected ? '16px' : '14px',
      borderRadius: '9px',
      border: createStroke(selected ? '#157AFF' : '#95A3B8'),
      position: 'relative',
      boxSizing: 'border-box',
    },
    dot: {
      position: 'absolute',
      left: selected ? '13px' : '4px',
      top: '4px',
      width: '5px',
      height: '5px',
      borderRadius: '2.5px',
      background: selected ? '#157AFF' : '#95A3B8',
      transition: 'all 220ms ease',
    },
  }),
  trend: ({ selected }: IconProps) => ({
    wrapper: {
      position: 'relative',
      width: selected ? '26px' : '22px',
      height: selected ? '22px' : '18px',
    },
    lineA: {
      position: 'absolute',
      left: '3px',
      bottom: '7px',
      width: '9px',
      borderTop: createStroke(selected ? '#157AFF' : '#95A3B8'),
      transform: 'rotate(18deg)',
      transformOrigin: 'left center',
    },
    lineB: {
      position: 'absolute',
      left: '11px',
      bottom: '10px',
      width: '8px',
      borderTop: createStroke(selected ? '#157AFF' : '#95A3B8'),
      transform: 'rotate(-28deg)',
      transformOrigin: 'left center',
    },
    lineC: {
      position: 'absolute',
      left: '18px',
      bottom: '13px',
      width: '6px',
      borderTop: createStroke(selected ? '#157AFF' : '#95A3B8'),
      transform: 'rotate(35deg)',
      transformOrigin: 'left center',
    },
  }),
  calendar: ({ selected }: IconProps) => ({
    shell: {
      width: selected ? '22px' : '18px',
      height: selected ? '20px' : '16px',
      borderRadius: '6px',
      border: createStroke(selected ? '#157AFF' : '#95A3B8'),
      position: 'relative',
      boxSizing: 'border-box',
    },
    bar: {
      position: 'absolute',
      left: '3px',
      right: '3px',
      top: '6px',
      borderTop: createStroke(selected ? '#157AFF' : '#95A3B8'),
    },
    pinLeft: {
      position: 'absolute',
      left: '5px',
      top: '-4px',
      width: '3px',
      height: '6px',
      borderRadius: '2px',
      background: selected ? '#157AFF' : '#95A3B8',
    },
    pinRight: {
      position: 'absolute',
      right: '5px',
      top: '-4px',
      width: '3px',
      height: '6px',
      borderRadius: '2px',
      background: selected ? '#157AFF' : '#95A3B8',
    },
  }),
  mine: ({ selected }: IconProps) => ({
    wrapper: {
      position: 'relative',
      width: selected ? '26px' : '22px',
      height: selected ? '22px' : '18px',
    },
    head: {
      position: 'absolute',
      left: '9px',
      top: '2px',
      width: selected ? '9px' : '8px',
      height: selected ? '9px' : '8px',
      borderRadius: selected ? '4.5px' : '4px',
      border: createStroke(selected ? '#157AFF' : '#95A3B8'),
      boxSizing: 'border-box',
    },
    body: {
      position: 'absolute',
      left: '5px',
      bottom: '2px',
      width: selected ? '16px' : '14px',
      height: selected ? '9px' : '8px',
      borderTopLeftRadius: '9px',
      borderTopRightRadius: '9px',
      border: createStroke(selected ? '#157AFF' : '#95A3B8'),
      borderBottom: 'none',
      boxSizing: 'border-box',
    },
  }),
};
