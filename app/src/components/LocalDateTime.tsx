"use client";

import { Suspense, useEffect, useState } from "react";

export default function LocalDateTime({ date }: { date: Date | string | number }) {
  const hydrated = useHydration();

  return (
    <Suspense key={hydrated ? "local" : "utc"}>
      <time dateTime={new Date(date).toISOString()}>{new Date(date).toLocaleString()}</time>
    </Suspense>
  );
}

function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
