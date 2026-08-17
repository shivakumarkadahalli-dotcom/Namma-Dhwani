import React from 'react';
import { AuthLoginPage } from './AuthLoginPage';

export const AuthRegisterPage: React.FC = () => {
  return <AuthLoginPage defaultRole="citizen" />;
};
