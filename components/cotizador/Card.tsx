import React from "react";

// =====================================================
// Card Component
// =====================================================

type CardProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm border border-[#e0e6ed] dark:border-[#1b2e4b] p-6 ${className}`}>
      <div className="mb-4">{title}</div>
      {children}
    </div>
  );
}
