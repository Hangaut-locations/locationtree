import type { AxiosError } from "axios";

export type ApiError = AxiosError<{
  message?: string;
  data?: { field: string; messages: string[] }[];
}>;

/** The API answers validation errors with a generic message and the real reasons per field. */
export const getErrorMessage = (err: ApiError, fallback: string) => {
  const fieldErrors = err.response?.data?.data;
  return (
    (Array.isArray(fieldErrors) && fieldErrors[0]?.messages?.[0]) ||
    err.response?.data?.message ||
    fallback
  );
};
