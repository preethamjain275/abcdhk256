export function getTimeLeft(expiryDate: string): string {
  const total = Date.parse(expiryDate) - Date.parse(new Date().toString());
  if (total <= 0) return '00h 00m 00s';
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}
