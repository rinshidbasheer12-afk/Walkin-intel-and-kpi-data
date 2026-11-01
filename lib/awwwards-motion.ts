export function nextScrollVisibility(y: number, lastY: number, wasVisible: boolean) {
  if (y < 10 || y < lastY - 2) return true;
  if (y > lastY + 2) return false;
  return wasVisible;
}
