import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Create a New Game heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Create a New Game/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders Start Game button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Start Game/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders Fetch Teams button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Fetch Teams/i);
  expect(buttonElement).toBeInTheDocument();
});
