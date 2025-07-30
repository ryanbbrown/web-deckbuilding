import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });

  it('displays the correct text', () => {
    render(<Footer />);

    // Test that the footer text is present
    expect(screen.getByText('Deckbuilding Sandbox')).toBeInTheDocument();
  });

  it('has the correct semantic HTML structure', () => {
    render(<Footer />);

    // Test for proper footer semantic element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
