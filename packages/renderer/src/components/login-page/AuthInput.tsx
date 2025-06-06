import visibilityOffIcon from '@assets/icons/visibility-off.svg';
import visibilityOnIcon from '@assets/icons/visibility-on.svg';
import { showMessageBox } from '@renderer/scripts/utils/messagebox';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';

interface AuthInputProps {
  onEmailChange?: (email: string) => void;
  onComplete: (email: string, password: string) => Promise<string | undefined>;
  buttonText: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ buttonText, onComplete, onEmailChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [inputType, setInputType] = useState<'password' | 'text'>('password');

  const attemptingSignIn = useRef(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm();

  const attemptSignIn = async () => {
    if (attemptingSignIn.current) return;

    attemptingSignIn.current = true;
    const authResult = await onComplete(email, password);
    attemptingSignIn.current = false;

    if (!authResult) return;

    // Ex: Firebase: Error (auth/wrong-password) - get what's inside the parentheses
    const errorCode = /auth\/[^)\s]+/.exec(authResult)?.[0];
    switch (errorCode) {
      case 'auth/user-not-found':
        setError('email', { type: 'manual', message: 'No user found with that email.' });
        break;
      case 'auth/too-many-requests':
        setError('email', {
          type: 'manual',
          message: 'Too many requests. Please try again later.',
        });
        break;
      case 'auth/email-already-in-use':
        setError('email', { type: 'manual', message: 'Email already in use.' });
        break;
      case 'auth/wrong-password':
        setError('password', { type: 'manual', message: 'Incorrect password.' });
        break;
      case 'auth/weak-password':
        setError('password', {
          type: 'manual',
          message: 'Password must be at least 6 characters long.',
        });
        break;
      default:
        showMessageBox('Sign-In Error', authResult, 'error');
        break;
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit(() => attemptSignIn())}>
      <input
        type="text"
        placeholder="Email"
        {...register('email', { required: true, validate: (value) => isEmail(value) })}
        id="emailInput"
        className="large-input"
        onChange={(e) => {
          setEmail(e.target.value.trim());
          if (onEmailChange) onEmailChange(e.target.value.trim());
          e.target.value = e.target.value.trim();

          clearErrors('email');
        }}
        aria-invalid={errors.email ? 'true' : 'false'}
      />
      {errors.email?.type === 'validate' && (
        <p role="alert" className="error">
          Invalid email. Make sure your email is properly formatted (e.g. johndoe@email.com)
        </p>
      )}
      {errors.email?.type === 'required' && (
        <p role="alert" className="error">
          Email required.
        </p>
      )}
      {errors.email?.type === 'manual' && (
        <p role="alert" className="error">
          {errors.email.message?.toString()}
        </p>
      )}
      <br />
      <div className="icon-input-wrapper">
        <input
          {...register('password', { required: true })}
          type={inputType}
          placeholder="Password"
          id="passwordInput"
          className="large-input"
          onChange={(e) => {
            setPassword(e.target.value);
            clearErrors('password');
          }}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        <button
          onClick={() => setInputType(inputType === 'password' ? 'text' : 'password')}
          aria-label="Toggle password visibility"
          type="button"
        >
          <img
            src={inputType === 'password' ? visibilityOffIcon : visibilityOnIcon}
            className="svg-filter"
            draggable="false"
            alt="Toggle password visibility"
          />
        </button>
      </div>
      {errors.password?.type === 'required' && (
        <p role="alert" className="error">
          Password required.
        </p>
      )}
      {errors.password?.type === 'manual' && (
        <p role="alert" className="error">
          {errors.password.message?.toString()}
        </p>
      )}
      <br />
      <button type="submit" className="gradient-button" id="finalCreateAccountBtn">
        {buttonText}
      </button>
    </form>
  );
};
