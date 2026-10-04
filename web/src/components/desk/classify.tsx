"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ClassifyButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          setPending(true);
          setError(null);
          void fetch("/app/classify", { method: "POST" })
            .then(async (res) => {
              if (!res.ok) throw new Error("The engine did not classify the invoice.");
              router.refresh();
            })
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Classify failed.");
            })
            .finally(() => setPending(false));
        }}
        >
        {pending ? "Classifying" : "Classify invoice"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
