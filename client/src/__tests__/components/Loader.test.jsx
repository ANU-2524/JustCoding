import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../../components/Loader';

describe('Loader Component', () => {
  it('renders with default message', () => {
    render(<Loader />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<Loader message="Running code..." />);
    expect(screen.getByText('Running code...')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<Loader message="Processing" />);
    const loader = screen.getByRole('status') || screen.getByText('Processing').closest('div');
    expect(loader).toBeInTheDocument();
  });
});
