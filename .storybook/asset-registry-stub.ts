export function getAssetByID(): {
  httpServerLocation: string;
  name: string;
  type: string;
} {
  return { httpServerLocation: '', name: '', type: '' };
}

export function registerAsset(): number {
  return 0;
}

export default { getAssetByID, registerAsset };
