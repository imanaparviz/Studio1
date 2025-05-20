"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  // Only run the effect on the client
  useEffect(() => {
    // Double-check we're in a browser environment
    if (typeof document !== "undefined") {
      console.log("ClientOnly: Component mounted on client");
      setHasMounted(true);
    }
  }, []);

  if (!hasMounted) {
    console.log("ClientOnly: Rendering fallback");
    return <>{fallback}</>;
  }

  console.log("ClientOnly: Rendering children");
  return <>{children}</>;
}
