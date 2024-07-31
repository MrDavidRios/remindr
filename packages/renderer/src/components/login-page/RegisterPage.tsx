import angelRightIcon from '@assets/icons/angel-right.svg';
import type { AuthPageType } from '@remindr/shared';
import type { Dispatch, SetStateAction } from 'react';
import { AuthInput } from './AuthInput';

interface RegisterPageProps {
  setPage: Dispatch<SetStateAction<AuthPageType>>;
}
export function RegisterPage(props: RegisterPageProps) {
  const { setPage } = props;

  return (
    <>
      <button
        type="button"
        id="backBtn"
        onClick={() => setPage('login')}
      >
        <img
          src={angelRightIcon}
          className="svg-filter"
          draggable="false"
          alt=""
        />
        <p>Back</p>
      </button>
      <div id="loginPage">
        <h1 id="loginPageHeader">Create Account</h1>
        <AuthInput
          onComplete={(email, password) => attemptRegister(email, password, setPage)}
          buttonText="Register"
        />
      </div>
    </>
  );
}

async function attemptRegister(
  email: string,
  password: string,
  setPage: Dispatch<SetStateAction<AuthPageType>>,
): Promise<string | undefined> {
  const createUserResult: string = await window.firebase.auth.createUserWithEmailAndPassword(
    email,
    password,
  );

  if (typeof createUserResult !== 'boolean') return createUserResult;

  setPage('login');
  return undefined;
}
