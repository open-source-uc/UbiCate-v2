"use client";

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

type QueryParams = {
  place?: string | null;
  lat?: string | null;
  lng?: string | null;
  campus?: string | null;
};

const useUpdateQueryParams = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter()

  const updateQueryParams = (params: QueryParams, newPathname?: string): void => {
    const updatedSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        updatedSearchParams.delete(key);
      } else if (value !== undefined) {
        updatedSearchParams.set(key, value);
      }
    });

    const newUrl = `${newPathname || pathname}?${updatedSearchParams.toString()}`;
    router.push(newUrl)
  };

  return updateQueryParams;
};

export default useUpdateQueryParams;
