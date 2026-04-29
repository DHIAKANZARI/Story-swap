import { useEffect, useState } from 'react';

export default function ScreenWipe({ triggerKey }) {
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (!triggerKey) return;
    setIsWiping(true);
    const t = setTimeout(() => {
      setIsWiping(false);
    }, 600);
    return () => clearTimeout(t);
  }, [triggerKey]);

  if (!isWiping) return null;

  return (
    <div className="screen-wipe"></div>
  );
}
