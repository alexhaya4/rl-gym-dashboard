import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';

vi.mock('../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../../api/oauth', () => ({
  oauthApi: {
    googleLogin: vi.fn(),
    githubLogin: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe('Login page', () => {
  it('renders username and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('does not render email field in login mode', () => {
    renderLogin();
    expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument();
  });

  it('shows email field after switching to register mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('renders OAuth buttons', () => {
    renderLogin();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    renderLogin();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});
