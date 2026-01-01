import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string; // Allow custom overrides
  target?: string;
  rel?: string;
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  target,
  rel,
  ...props
}: ButtonProps) {
  // Base styles: Simple, clean, rounded-full (capsule) styling
  const baseStyles =
    "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-200 ease-in-out rounded-full text-center disabled:opacity-50 disabled:pointer-events-none";

  // Sizes
  const sizeStyles = {
    sm: "px-6 py-2.5 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-sm",
  };

  // Variants
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#9251A5] to-[#E91E8C] hover:from-[#E91E8C] hover:to-[#9251A5] text-white",
    outline:
      "bg-black border border-gray-600 hover:border-white text-white hover:bg-white/5",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
        target={target}
        rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
      >
        {children}
      </Link>
    );
  }

  // Render as standard Button
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
