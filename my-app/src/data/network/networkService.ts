import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

function isConnectedState(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export async function getIsOnline() {
  const state = await NetInfo.fetch();
  return isConnectedState(state);
}

export function subscribeOnlineStatus(onChange: (isOnline: boolean) => void) {
  return NetInfo.addEventListener((state) => {
    onChange(isConnectedState(state));
  });
}
