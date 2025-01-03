import { useAppSelector } from '@renderer/hooks';
import { FC } from 'react';
import { StreamEditor } from './stream-editor/StreamEditor';
import { StreamsDashboard } from './StreamsDashboard';

export const StreamsPage: FC = () => {
  const currentStream = useAppSelector((state) => state.streamList.currentStream);

  return <div id="streamsPage">{currentStream ? <StreamEditor /> : <StreamsDashboard />}</div>;
};
