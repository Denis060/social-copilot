"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Wait for webhook to process, then refresh to pick up new plan
    const timer = setTimeout(() => {
      setStatus("success");
      router.refresh();
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing your payment...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="size-12 text-green-500" />
              <h3 className="text-lg font-semibold">
                Welcome to Premium!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your account has been upgraded. You now have access to all
                premium features.
              </p>
              <div className="flex gap-3">
                <Link href="/composer">
                  <Button size="sm">Create a Post</Button>
                </Link>
                <Link href="/settings/billing">
                  <Button variant="outline" size="sm">
                    View Billing
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please check your billing page.
              </p>
              <Link href="/settings/billing">
                <Button variant="outline" size="sm">
                  Go to Billing
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
