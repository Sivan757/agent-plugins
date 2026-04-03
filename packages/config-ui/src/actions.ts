/**
 * HTTP handlers for saving and loading configuration.
 * The config-ui server provides /save and /config endpoints.
 */

export async function saveConfig(
  state: Record<string, unknown>,
  csrfToken: string,
): Promise<void> {
  const res = await fetch('/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(state),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Save failed (${res.status}): ${text}`);
  }
}

