/**
 * Skeleton Loading Components
 * 
 * Reusable skeleton components for loading states
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

// Base skeleton component
export function Skeleton({ className = '', width, height, rounded = false }: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    />
  );
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="border rounded-xl p-6 space-y-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton height="24px" className="w-3/4" />
          <Skeleton height="16px" className="w-1/2" />
        </div>
        <Skeleton width="60px" height="24px" rounded />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton height="16px" className="w-full" />
        <Skeleton height="16px" className="w-4/5" />
        <Skeleton height="16px" className="w-2/3" />
      </div>

      {/* Event details */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton width="16px" height="16px" />
          <Skeleton height="16px" className="w-1/3" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton width="16px" height="16px" />
          <Skeleton height="16px" className="w-1/4" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton width="16px" height="16px" />
          <Skeleton height="16px" className="w-1/5" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Skeleton height="36px" className="flex-1" />
        <Skeleton height="36px" className="flex-1" />
      </div>
    </div>
  );
}

// Event details skeleton
export function EventDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Main Event Information */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <Skeleton height="36px" className="w-3/4 mb-4" />
            <div className="flex flex-wrap gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton width="16px" height="16px" />
                  <Skeleton height="16px" width="120px" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Skeleton width="80px" height="32px" />
            <Skeleton width="80px" height="32px" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton height="20px" className="w-full" />
          <Skeleton height="20px" className="w-4/5" />
          <Skeleton height="20px" className="w-3/4" />
        </div>

        <div className="mt-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <Skeleton height="20px" width="200px" />
            <div className="flex gap-3">
              <Skeleton width="100px" height="36px" />
              <Skeleton width="100px" height="36px" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Information */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton width="20px" height="20px" />
          <Skeleton height="24px" width="150px" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton width="48px" height="48px" rounded />
          <div className="space-y-2">
            <Skeleton height="18px" width="120px" />
            <Skeleton height="16px" width="180px" />
          </div>
        </div>
      </div>

      {/* Attendees Section */}
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton width="20px" height="20px" />
          <Skeleton height="24px" width="120px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Skeleton width="32px" height="32px" rounded />
              <div className="space-y-1">
                <Skeleton height="14px" width="80px" />
                <Skeleton height="12px" width="100px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Event list skeleton
export function EventListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Attendee list skeleton
export function AttendeeListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Skeleton width="32px" height="32px" rounded />
          <div className="space-y-1 flex-1">
            <Skeleton height="14px" className="w-3/4" />
            <Skeleton height="12px" className="w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-white space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton width="20px" height="20px" />
        <Skeleton height="28px" width="200px" />
      </div>

      {/* Form fields */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="40px" className="w-full" />
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <Skeleton height="40px" className="flex-1" />
        <Skeleton height="40px" className="flex-1" />
      </div>
    </div>
  );
}

// Header skeleton
export function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Skeleton width="32px" height="32px" />
            <Skeleton height="24px" width="180px" />
          </div>
          
          <div className="flex items-center gap-4">
            <Skeleton width="100px" height="32px" />
            <Skeleton width="120px" height="32px" />
          </div>
        </div>
      </div>
    </header>
  );
}

// Loading overlay component
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
}

// Pulse animation for general use
export function PulseLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`} />
  );
} 