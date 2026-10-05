"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
  UpdateProfilePayload,
} from "@/services/users";

export const profileQueryKeys = {
  all: ["profile"] as const,
  me: (userId?: string) => ["profile", userId ?? "me"] as const,
};

/**
 * Hook de TanStack Query para el perfil del usuario,
 * incluyendo lectura, previsualización en vivo y actualización del color personalizado de la rueda.
 */
export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile | null, Error>({
    queryKey: profileQueryKeys.me(user?.id),
    queryFn: () => getUserProfile(),
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const setPreviewColor = useCallback(
    (color: string | null) => {
      queryClient.setQueryData<UserProfile | null>(
        profileQueryKeys.me(user?.id),
        (old) => {
          if (!old) return old;
          if (old.color === color) return old;
          return {
            ...old,
            color,
          };
        }
      );
    },
    [queryClient, user?.id]
  );

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateUserProfile(payload),
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.me(user?.id) });
      const previous = queryClient.getQueryData<UserProfile | null>(
        profileQueryKeys.me(user?.id)
      );

      if (previous) {
        queryClient.setQueryData<UserProfile | null>(
          profileQueryKeys.me(user?.id),
          {
            ...previous,
            ...newPayload,
          }
        );
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileQueryKeys.me(user?.id), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.me(user?.id) });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setPreviewColor,
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
