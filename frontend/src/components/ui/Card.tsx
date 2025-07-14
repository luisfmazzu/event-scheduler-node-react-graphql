/**
 * Card Component
 * 
 * A reusable card component for displaying content in a contained,
 * elevated style consistent with the Event Scheduler design system.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
}

/**
 * Card component for displaying content in a structured container
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  onClick,
  hover = false,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        hover && 'transition-smooth hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card header component for titles and actions
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card content component for main body content
 */
export const CardContent: React.FC<CardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card footer component for actions and additional information
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
}; 