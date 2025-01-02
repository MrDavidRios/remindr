import _ from 'lodash';
import { Stream, StreamTask } from '../types/stream.js';

/**
 * Serializes a Stream into a plain js object for Firestore to read.
 * @param stream
 * @returns
 */
export const serializeStream = (stream: Stream): object => {
  const serializedStream: Stream = { ..._.omit(stream, 'tasks'), tasks: [] };

  const serializedTasks = stream.tasks.map((task: StreamTask) => {
    if (typeof task === 'string') {
      return task;
    }

    return { ...task };
  });

  serializedStream.tasks = serializedTasks;

  return serializedStream;
};
