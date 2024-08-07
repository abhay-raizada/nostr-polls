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

export const fetchUserProfile = async (pubkey: string) => {
  const pool = new SimplePool();
  let result = await pool.get(defaultRelays, { kinds: [0], authors: [pubkey] });
  pool.close(defaultRelays);
  return result;
};


export function openProfileTab(npub: `npub1${string}`) {
  let url = `https://njump.me/${npub}`
  window?.open(url, '_blank')?.focus();
}