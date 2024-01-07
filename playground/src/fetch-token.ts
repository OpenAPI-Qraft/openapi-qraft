export const fetchToken = async (
  {
    client_id,
    client_secret,
    ...params
  }: { client_id: string; client_secret: string } & (
    | {
        grant_type: 'entity_user';
        entity_user_id: string;
      }
    | {
        grant_type: 'client_credentials';
      }
  ),
  {
    baseURL,
    version,
  }: {
    version: string;
    baseURL: string;
  }
): Promise<AccessToken> => {
  const response = await fetch(`${baseURL}/auth/token`, {
    method: 'POST',
    headers: {
      'X-Monite-Version': version,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      grant_type: params.grant_type,
      ...(params.grant_type === 'entity_user'
        ? {
            entity_user_id: params.entity_user_id,
          }
        : {}),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      await response
        .json()
        .catch(() => ({ message: response.text() }))
        .then(({ error: { message } }) => `Failed to fetch token: ${message}`)
        .catch(() => 'Failed to fetch token')
    );
  }

  return response.json();
};

export type AccessToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};
