import type { AuthPageType } from '@remindr/shared';
import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export function AuthPage() {
  const [page, setPage] = useState<AuthPageType>('login');

  return (
    <section id="login" className="frosted">
      {page === 'login' ? <LoginPage setPage={setPage} /> : <RegisterPage setPage={setPage} />}
    </section>
  );
}
