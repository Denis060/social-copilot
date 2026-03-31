"use client";

import { PLATFORMS } from '@/lib/platforms';
import { Lock, Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DisconnectButton } from './DisconnectButton';
import Link from 'next/link';

interface AccountsGridProps {
  accounts: Record<string, unknown>[];
  hasReachedLimit: boolean;
}

export function AccountsGrid({ accounts, hasReachedLimit }: AccountsGridProps) {
  const getPlatformAccount = (platformId: string) => {
    return accounts.find((a: Record<string, unknown>) => a.platform === platformId);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.values(PLATFORMS).map((platform) => {
        const connected = getPlatformAccount(platform.id);
        const isLocked = !connected && hasReachedLimit;
        
        return (
          <Card key={platform.id} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {platform.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {connected 
                  ? `Connected on ${new Date(connected.created_at).toLocaleDateString()}` 
                  : 'Connect your account to enable posting'}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                {connected ? (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connected</span>
                    <DisconnectButton accountId={connected.id} platformName={platform.name} />
                  </div>
                ) : isLocked ? (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Lock className="h-4 w-4 text-orange-500" /> Locked (Free Plan)
                    </span>
                    <Link href="/billing" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Upgrade
                    </Link>
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm text-muted-foreground">Not connected</span>
                    <Link href={`/api/oauth/connect?platform=${platform.id}`} className={buttonVariants({ size: "sm" })}>
                      <Plus className="mr-2 h-4 w-4" /> Connect
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
