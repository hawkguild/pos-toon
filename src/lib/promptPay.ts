// Utility for generating Thai QR PromptPay EMVCo Payload and QR Code Images

export function crc16ccitt(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function sanitizePromptPayId(target: string): { type: 'mobile' | 'taxId'; value: string; raw: string } {
  const cleaned = target.replace(/[^0-9]/g, '');
  if (cleaned.length === 13) {
    return { type: 'taxId', value: cleaned, raw: target };
  }
  let mobile = cleaned;
  if (mobile.startsWith('0')) {
    mobile = '0066' + mobile.slice(1);
  } else if (mobile.length === 9) {
    mobile = '0066' + mobile;
  }
  return { type: 'mobile', value: mobile, raw: target };
}

export function generatePromptPayPayload(promptPayId: string, amount?: number): string {
  if (!promptPayId) return '';
  const sanitized = sanitizePromptPayId(promptPayId);

  // Tag 29 Merchant Information (PromptPay)
  const aid = formatTag('00', 'A000000677010111');
  const accountTag =
    sanitized.type === 'mobile'
      ? formatTag('01', sanitized.value)
      : formatTag('02', sanitized.value);
  const tag29 = formatTag('29', aid + accountTag);

  let payload = '000201'; // Format Indicator
  payload += amount && amount > 0 ? '010212' : '010211'; // 12 Dynamic, 11 Static
  payload += tag29;
  payload += formatTag('53', '764'); // THB currency code

  if (amount && amount > 0) {
    payload += formatTag('54', amount.toFixed(2));
  }

  payload += formatTag('58', 'TH'); // Country Code TH
  payload += '6304'; // Checksum Tag Header

  const crc = crc16ccitt(payload);
  return payload + crc;
}

export function getPromptPayQrImageUrl(promptPayId: string, amount?: number): string {
  const payload = generatePromptPayPayload(promptPayId, amount);
  if (!payload) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    payload
  )}`;
}

export function getPromptPayIoUrl(promptPayId: string, amount?: number): string {
  const cleaned = promptPayId.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  if (amount && amount > 0) {
    return `https://promptpay.io/${cleaned}/${amount}.png`;
  }
  return `https://promptpay.io/${cleaned}.png`;
}
