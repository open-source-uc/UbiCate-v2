function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return origin;
    }

    if (hostname === 'osuc.dev' || hostname.endsWith('.osuc.dev') ||
        hostname === 'uc.cl' || hostname.endsWith('.uc.cl')) {
      return origin;
    }
  } catch (error) {
    // URL inválida
    return null;
  }
  
  return null;
}