import remindrLoadingIcon from '@assets/icons/logo-full-size.png';
import { FC } from 'react';

export const LoadingScreen: FC = () => {
  return (
    <div id="loadingScreenContainer" className="frosted">
      <img id="loadingScreenImg" src={remindrLoadingIcon} draggable="false" />
      <h1 id="loadingHeader">{getGreetingText()}</h1>
      <button type="button" id="retryConnectBtn" className="large-button hidden">
        Retry
      </button>
      <button type="button" id="offlineBtn" className="large-button hidden" title="No login required!">
        Go Offline
      </button>
    </div>
  );
};

function getGreetingText() {
  const today = new Date();
  const curHr = today.getHours();

  if (curHr < 12) return 'Good morning!';
  if (curHr < 18) return 'Good afternoon!';

  return 'Good evening!';
}
