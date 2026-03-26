import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'record' | 'dashboard' | 'line' | 'card';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'line' }) => {
  if (variant === 'dashboard') {
    return (
      <div className={`p-6 sm:p-8 space-y-8 w-full max-w-7xl mx-auto min-h-screen ${className}`}>
        {/* Header skeleton */}
        <div className="flex justify-between items-center pt-4">
          <div className="space-y-3">
            <div className="h-8 sm:h-10 w-48 sm:w-64 bg-primary/15 rounded-xl animate-pulse"></div>
            <div className="h-4 w-32 bg-primary/10 rounded-md animate-pulse"></div>
          </div>
          <div className="h-12 w-12 bg-primary/15 rounded-full animate-pulse"></div>
        </div>
        
        {/* Vitals Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-36 glass-pro-max rounded-2xl animate-pulse p-5 flex flex-col justify-between border-primary/10">
              <div className="h-10 w-10 bg-primary/15 rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 w-16 bg-primary/10 rounded"></div>
                <div className="h-7 w-24 bg-primary/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Body Skeleton */}
        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-2 h-72 glass-pro-max rounded-[2rem] animate-pulse p-6 border-primary/10">
             <div className="h-6 w-48 bg-primary/15 rounded mb-8"></div>
             <div className="h-40 w-full bg-primary/5 rounded-xl"></div>
           </div>
           <div className="h-72 glass-pro-max rounded-[2rem] animate-pulse p-6 border-primary/10 space-y-6">
             <div className="h-6 w-32 bg-primary/15 rounded"></div>
             <div className="space-y-4 pt-2">
                {[1,2,3].map(j => (
                  <div key={j} className="h-12 w-full bg-primary/5 rounded-xl"></div>
                ))}
             </div>
           </div>
        </div>
      </div>
    );
  }

  if (variant === 'record') {
     return (
       <div className={`glass-pro-max rounded-2xl p-5 w-full flex items-center gap-4 animate-pulse border-primary/10 ${className}`}>
         <div className="h-12 w-12 bg-primary/15 rounded-xl flex-shrink-0"></div>
         <div className="space-y-3 flex-1">
           <div className="h-5 w-1/3 bg-primary/15 rounded"></div>
           <div className="h-4 w-1/4 bg-primary/10 rounded"></div>
         </div>
         <div className="h-8 w-20 bg-primary/10 rounded-full flex-shrink-0"></div>
       </div>
     );
  }
  
  if (variant === 'card') {
      return <div className={`glass-pro-max rounded-3xl animate-pulse min-h-[16rem] bg-primary/5 border-primary/10 ${className}`} />
  }

  // default 'line'
  return (
    <div className={`animate-pulse rounded-md bg-primary/15 ${className}`} />
  );
};

export default Skeleton;
