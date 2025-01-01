import { connect } from 'http2';

export function hasNetworkConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const client = connect('https://www.google.com');
    client.on('connect', () => {
      resolve(true);
      client.destroy();
    });
    client.on('error', () => {
      resolve(false);
      client.destroy();
    });
  });
}
