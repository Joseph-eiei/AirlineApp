const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const supabaseConfig = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_KEY),
};

export type RestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RestRequest<T> {
  table: string;
  method?: RestMethod;
  query?: string;
  select?: string;
  body?: T;
  prefer?: string;
}

export interface RestResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

export const supabaseRest = async <TResponse, TBody = unknown>(
  request: RestRequest<TBody>,
): Promise<RestResponse<TResponse>> => {
  if (!supabaseConfig.isConfigured) {
    return { error: 'Supabase is not configured.' };
  }

  const { table, method = 'GET', query, select = '*', body, prefer } = request;
  const url = new URL(`${supabaseConfig.url}/rest/v1/${table}`);
  url.searchParams.set('select', select);
  if (query) {
    const queryParams = new URLSearchParams(query);
    queryParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  const headers: Record<string, string> = {
    apikey: supabaseConfig.key,
    Authorization: `Bearer ${supabaseConfig.key}`,
    'Content-Type': 'application/json',
  };

  if (prefer) {
    headers.Prefer = prefer;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { error: errorText || response.statusText, status: response.status };
  }

  if (response.status === 204) {
    return { data: undefined, status: response.status };
  }

  try {
    const data = (await response.json()) as TResponse;
    return { data, status: response.status };
  } catch (error) {
    return { data: undefined, status: response.status };
  }
};
