interface Profile {
  plan: string;
  posts_this_month: number;
}

const FREE_SOCIAL_ACCOUNT_LIMIT = 1;
const FREE_POSTS_PER_MONTH = 10;

export function canAddSocialAccount(
  profile: Profile,
  currentAccountCount: number
): boolean {
  if (profile.plan === "premium") return true;
  return currentAccountCount < FREE_SOCIAL_ACCOUNT_LIMIT;
}

export function canCreatePost(profile: Profile): boolean {
  if (profile.plan === "premium") return true;
  return profile.posts_this_month < FREE_POSTS_PER_MONTH;
}

export function canUseAutoReply(profile: Profile): boolean {
  return profile.plan === "premium";
}
