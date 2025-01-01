import type { User } from '@remindr/shared';
import { FC } from 'react';

interface AccountDetailsProps {
  userData?: User;
}

export const AccountDetails: FC<AccountDetailsProps> = ({ userData }) => {
  if (!userData) return <p>Loading user data...</p>;

  return (
    <div id="accountDetailsWrapper">
      <div id="accountDetails">
        {userData?.name && (
          <p id="profileName" title="Edit Name">
            {userData.name}
          </p>
        )}
        {userData?.email && <p id="profileEmail">{userData.email}</p>}
      </div>
    </div>
  );
};
