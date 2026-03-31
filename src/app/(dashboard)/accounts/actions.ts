'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function disconnectAccount(socialAccountId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('id', socialAccountId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to disconnect account');
  }

  revalidatePath('/accounts');
  return { success: true };
}
