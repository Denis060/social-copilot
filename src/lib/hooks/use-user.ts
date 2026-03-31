import { useAuth } from "@/components/providers/auth-provider";

export function useUser() {
  const { user, profile, isLoading } = useAuth();
  
  return {
    user,
    profile,
    isLoading,
  };
}
