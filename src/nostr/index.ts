import { SimplePool } from "nostr-tools";

export const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.hllo.live",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
  "wss://relay.mutinywallet.com",
];

export const fetchUserProfile = async (pubkey: string, pool: SimplePool) => {
  let result = await pool.get(defaultRelays, { kinds: [0], authors: [pubkey] });
  return result;
};

export const fetchUserProfiles = async (pubkeys: string[], pool: SimplePool) => {
  let result = await pool.querySync(defaultRelays, { kinds: [0], authors: pubkeys });
  return result;
};

export const fetchComments = async (eventIds: string[], pool: SimplePool) => {
  let result = await pool.querySync(defaultRelays, { kinds: [1], "#e": eventIds });
  return result;
}



export function openProfileTab(npub: `npub1${string}`) {
  let url = `https://njump.me/${npub}`
  window?.open(url, '_blank')?.focus();
}