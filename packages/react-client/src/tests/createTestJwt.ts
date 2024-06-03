export function createTestJwt(payload: { exp: number; iat: number }) {
  function base64url(source: string) {
    // Encode in base64
    let encodedSource = Buffer.from(source).toString('base64');

    // Replace characters to get base64url
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
  }

  // Token header
  const header = {
    alg: 'none',
    typ: 'JWT',
  };

  // Encode header and payload in base64url
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  // Create token without signature
  return `${encodedHeader}.${encodedPayload}.`;
}
