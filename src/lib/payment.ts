const VIETQR_CONFIG = {
  bankId: 'BIDV',
  accountNo: '8845478944',
  accountName: 'MAMASHEVA AKYLAI',
  template: 'compact2',
};

export function generateVietQRUrl(amount: number, orderNumber: string, description?: string): string {
  const { bankId, accountNo, accountName, template } = VIETQR_CONFIG;
  const addInfo = description || orderNumber;
  const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
  const params = new URLSearchParams({ amount: amount.toString(), addInfo, accountName });
  return `${baseUrl}?${params.toString()}`;
}

export function generateVietQRData(amount: number, orderNumber: string) {
  return {
    bankId: VIETQR_CONFIG.bankId,
    accountNo: VIETQR_CONFIG.accountNo,
    accountName: VIETQR_CONFIG.accountName,
    amount,
    description: orderNumber,
    qrImageUrl: generateVietQRUrl(amount, orderNumber),
  };
}
