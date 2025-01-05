import clockIcon from '@assets/icons/clock.svg';
import { convertMsToSeconds, formatSeconds } from '@remindr/shared';
import store from '@renderer/app/store';
import { useAppSelector } from '@renderer/hooks';
import { FC, useEffect, useState } from 'react';

interface StreamTimeDisplayProps {
  active: boolean;
}

export const StreamTimeDisplay: FC<StreamTimeDisplayProps> = ({ active }) => {
  const currentStream = useAppSelector((state) => state.streamList.currentStream);

  if (currentStream === undefined) return <></>;

  const [elapsedTime, setElapsedTime] = useState(currentStream.elapsedTime);

  useEffect(() => {
    const updateElapsedTime = () => {
      const startTimestamp = store.getState().streamList.streamStartTimestamp;
      const elapsedTime = store.getState().streamList.currentStream?.elapsedTime;
      if (startTimestamp === undefined || elapsedTime === undefined) return;

      const totalElapsedTimeInMs = elapsedTime + new Date().getTime() - startTimestamp;
      setElapsedTime(totalElapsedTimeInMs);
    };

    updateElapsedTime();

    const interval = setInterval(() => updateElapsedTime(), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`stream-time-display ${active ? '' : 'inactive'}`}>
      <img src={clockIcon} draggable={false} alt="clock icon" />
      <p className="text-secondary">{`${formatSeconds(convertMsToSeconds(elapsedTime))}`}</p>
    </div>
  );
};
