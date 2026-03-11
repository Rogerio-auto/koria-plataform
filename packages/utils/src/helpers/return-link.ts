/**
 * Generates a return URL based on the lead's channel and the tenant's configured handles.
 */
export function generateReturnUrl(
  channel: string | null,
  returnChannels?: {
    whatsapp?: string;
    instagram?: string;
    messenger?: string;
    telegram?: string;
  },
): string | null {
  if (!channel || !returnChannels) return null;

  switch (channel) {
    case 'whatsapp': {
      const phone = returnChannels.whatsapp;
      if (!phone) return null;
      const digits = phone.replace(/\D/g, '');
      return `https://wa.me/${digits}`;
    }
    case 'instagram': {
      const handle = returnChannels.instagram;
      if (!handle) return null;
      const username = handle.replace(/^@/, '');
      return `https://ig.me/m/${username}`;
    }
    case 'messenger': {
      const page = returnChannels.messenger;
      if (!page) return null;
      return `https://m.me/${page}`;
    }
    case 'telegram': {
      const handle = returnChannels.telegram;
      if (!handle) return null;
      const username = handle.replace(/^@/, '');
      return `https://t.me/${username}`;
    }
    default:
      return null;
  }
}
