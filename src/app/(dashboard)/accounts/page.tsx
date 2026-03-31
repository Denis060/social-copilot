import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountsGrid } from './AccountsGrid';

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan || 'free';

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id);

  const connectedAccounts = accounts || [];
  const hasReachedLimit = plan === 'free' && connectedAccounts.length >= 1;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Social Accounts</h2>
          <p className="text-muted-foreground mt-1">
            Manage your connected social media platforms.
          </p>
        </div>
      </div>
      
      <AccountsGrid accounts={connectedAccounts} hasReachedLimit={hasReachedLimit} />
    </div>
  );
}
