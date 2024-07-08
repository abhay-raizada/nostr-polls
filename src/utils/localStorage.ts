const LOCAL_STORAGE_PUBKEY = "pollerama:pubkey";

export const getPubKeyFromLocalStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_PUBKEY);
};

export const setPubKeyInLocalStorage = (pubkey: string) => {
  localStorage.setItem(LOCAL_STORAGE_PUBKEY, pubkey);
};

export const removePubKeyFromLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_PUBKEY);
};
