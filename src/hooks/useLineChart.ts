import { useState } from 'react';

export type TimeSlot = 'week' | 'month';

export const useLineChart = (initialSlot: TimeSlot = 'week') => {
  const [slot, setSlot] = useState<TimeSlot>(initialSlot);

  const [data, setData] = useState<number[]>([]);

  const handleSlotChange = (newSlot: TimeSlot) => setSlot(newSlot);

  return {
    slot,
    data,
    setData,
    handleSlotChange
  };
};

export default useLineChart;
