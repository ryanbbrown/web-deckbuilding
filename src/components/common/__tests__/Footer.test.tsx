import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });

  it('displays the correct text', () => {
    render(<Footer />);

    // Test that the footer text is present
    expect(screen.getByText('Deck Building Game')).toBeInTheDocument();
  });

  it('has the correct semantic HTML structure', () => {
    render(<Footer />);

    // Test for proper footer semantic element
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      'mt-12',
      'py-8',
      'border-t',
      'border-gray-200',
      'bg-gray-50'
    );
  });

  it('contains centered text styling', () => {
    const { container } = render(<Footer />);

    // Find the div inside the footer that contains the styling classes
    const textContainer = container.querySelector('.max-w-7xl');
    expect(textContainer).toHaveClass(
      'max-w-7xl',
      'mx-auto',
      'px-4',
      'text-center',
      'text-gray-500',
      'text-sm'
    );
    expect(textContainer).toHaveTextContent('Deck Building Game');
  });
});
