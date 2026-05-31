import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query'
import type { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'
import type { PaginatedResult } from '@/types'

// ============================================================
// useSupabaseQuery
// Thin wrapper around react-query's useQuery that accepts a
// factory function returning a Supabase promise.
// ============================================================

type SupabaseQueryFn<T> = () => PromiseLike<
  PostgrestResponse<T> | PostgrestSingleResponse<T>
>

export function useSupabaseQuery<T>(
  queryKey: QueryKey,
  queryFn: SupabaseQueryFn<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      const result = await queryFn()
      if (result.error) throw new Error(result.error.message)
      return result.data as T
    },
    ...options,
  })
}

// ============================================================
// usePaginatedQuery
// Adds page / pageSize helpers on top of useSupabaseQuery.
// The factory fn receives { page, pageSize } and must apply
// .range() accordingly before returning the Supabase builder.
// ============================================================

interface PaginationParams {
  page: number
  pageSize: number
}

type PaginatedQueryFn<T> = (
  params: PaginationParams,
) => PromiseLike<{ data: T[] | null; count: number | null; error: { message: string } | null }>

export function usePaginatedSupabaseQuery<T>(
  queryKey: QueryKey,
  queryFn: PaginatedQueryFn<T>,
  pagination: PaginationParams,
  options?: Omit<UseQueryOptions<PaginatedResult<T>, Error>, 'queryKey' | 'queryFn'>,
) {
  const { page, pageSize } = pagination

  return useQuery<PaginatedResult<T>, Error>({
    queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), page, pageSize],
    queryFn: async () => {
      const result = await queryFn({ page, pageSize })
      if (result.error) throw new Error(result.error.message)

      const count = result.count ?? 0
      return {
        data: (result.data as T[]) ?? [],
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      }
    },
    ...options,
  })
}

// ============================================================
// useSupabaseMutation
// Thin wrapper around react-query's useMutation.
// Optionally invalidates query keys on success.
// ============================================================

type SupabaseMutationFn<TVariables, TData> = (
  variables: TVariables,
) => PromiseLike<PostgrestResponse<TData> | PostgrestSingleResponse<TData>>

interface UseSupabaseMutationOptions<TVariables, TData>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  invalidateKeys?: QueryKey[]
}

export function useSupabaseMutation<TVariables, TData = unknown>(
  mutationFn: SupabaseMutationFn<TVariables, TData>,
  options: UseSupabaseMutationOptions<TVariables, TData> = {},
) {
  const queryClient = useQueryClient()
  const { invalidateKeys, onSuccess, ...rest } = options

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const result = await mutationFn(variables)
      if (result.error) throw new Error(result.error.message)
      return result.data as TData
    },
    onSuccess: async (data, variables, context) => {
      if (invalidateKeys?.length) {
        await Promise.all(
          invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key as QueryKey })),
        )
      }
      onSuccess?.(data, variables, context)
    },
    ...rest,
  })
}
