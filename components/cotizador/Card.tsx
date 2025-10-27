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
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="mb-4">{title}</div>
      {children}
    </div>
  );
}
