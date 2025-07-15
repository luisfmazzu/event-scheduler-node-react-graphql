import React, { useState } from 'react';
import { AttendeeCard } from './AttendeeCard';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendeeListProps {
  attendees: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  pageSize?: number;
  showPagination?: boolean;
}

export function AttendeeList({ attendees, pageSize = 10, showPagination = true }: AttendeeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  if (attendees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No attendees yet. Be the first to RSVP!</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(attendees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentAttendees = attendees.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Attendee Cards */}
      <div className="space-y-3">
        {currentAttendees.map((attendee) => (
          <AttendeeCard key={attendee.id} attendee={attendee} />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, attendees.length)} of {attendees.length} attendees
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1);
                
                if (!showPage) {
                  // Show ellipsis for gaps
                  if (page === 2 && currentPage > 4) {
                    return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                  }
                  if (page === totalPages - 1 && currentPage < totalPages - 3) {
                    return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                  }
                  return null;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className="min-w-[32px]"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 