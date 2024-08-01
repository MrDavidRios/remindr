import type { User } from '@remindr/shared';

export function AccountDetails(props: { userData?: User }) {
  const { userData } = props;

  if (!userData) return <p>Loading user data...</p>;

  return (
    <div id="accountDetailsWrapper">
      <div id="accountDetails">
        <p id="profileName" title="Edit Name">
          {userData?.name ?? 'Placeholder name'}
        </p>
        <p id="profileEmail">{userData?.email ?? 'placeholder@placeholder.com'}</p>
      </div>
    </div>
  );
}
