/**
 * Button Component Tests
 * 
 * Tests the Button UI component functionality, variants, and accessibility
 */

import React from 'react';
import { renderWithProviders, userEvent } from '@/test-utils/test-helpers';
import { screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with text', () => {
      renderWithProviders(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('renders button with type="button" by default', () => {
      renderWithProviders(<Button>Default Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('renders button with custom type', () => {
      renderWithProviders(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Button Variants', () => {
    it('renders default variant', () => {
      renderWithProviders(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600'); // Assuming default is blue
    });

    it('renders primary variant', () => {
      renderWithProviders(<Button variant="primary">Primary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('renders secondary variant', () => {
      renderWithProviders(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200');
    });

    it('renders destructive variant', () => {
      renderWithProviders(<Button variant="destructive">Delete</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('renders outline variant', () => {
      renderWithProviders(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-gray-300');
    });

    it('renders ghost variant', () => {
      renderWithProviders(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Button Sizes', () => {
    it('renders default size', () => {
      renderWithProviders(<Button>Default Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2');
    });

    it('renders small size', () => {
      renderWithProviders(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1');
    });

    it('renders large size', () => {
      renderWithProviders(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3');
    });
  });

  describe('Button States', () => {
    it('renders disabled button', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('renders loading button', () => {
      renderWithProviders(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      // Should show loading indicator
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('hides text when loading with hideTextOnLoading', () => {
      renderWithProviders(
        <Button loading hideTextOnLoading>
          Save Changes
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('Save Changes');
    });
  });

  describe('Click Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom Props', () => {
    it('forwards custom className', () => {
      renderWithProviders(
        <Button className="custom-class">Custom Class</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards data attributes', () => {
      renderWithProviders(
        <Button data-testid="custom-button">Custom Button</Button>
      );
      
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('forwards aria attributes', () => {
      renderWithProviders(
        <Button aria-label="Custom Label">Button</Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });
  });

  describe('Accessibility', () => {
    it('is focusable by default', () => {
      renderWithProviders(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      renderWithProviders(<Button disabled>Not Focusable</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });

    it('has proper aria-disabled attribute when disabled', () => {
      renderWithProviders(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('has proper aria-busy attribute when loading', () => {
      renderWithProviders(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports space key activation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(<Button onClick={handleClick}>Space Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Support', () => {
    it('renders with left icon', () => {
      const LeftIcon = () => <svg data-testid="left-icon">Left</svg>;
      
      renderWithProviders(
        <Button leftIcon={<LeftIcon />}>With Left Icon</Button>
      );
      
      const icon = screen.getByTestId('left-icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(button).toHaveTextContent('With Left Icon');
    });

    it('renders with right icon', () => {
      const RightIcon = () => <svg data-testid="right-icon">Right</svg>;
      
      renderWithProviders(
        <Button rightIcon={<RightIcon />}>With Right Icon</Button>
      );
      
      const icon = screen.getByTestId('right-icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(button).toHaveTextContent('With Right Icon');
    });

    it('renders icon-only button', () => {
      const Icon = () => <svg data-testid="only-icon">Icon</svg>;
      
      renderWithProviders(
        <Button aria-label="Icon only button">
          <Icon />
        </Button>
      );
      
      const icon = screen.getByTestId('only-icon');
      const button = screen.getByRole('button');
      
      expect(icon).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Icon only button');
    });
  });
}); 