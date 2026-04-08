import { render, screen } from '@testing-library/react';
import App from './App';

test('renders expense tracker login screen', () => {
  render(<App />);
  expect(screen.getByText(/expense tracker/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
