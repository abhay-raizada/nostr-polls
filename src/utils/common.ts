export const isImageUrl = (url: string): boolean => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

export const calculateTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const postDate = new Date(timestamp * 1000); // Convert timestamp to milliseconds
  const differenceInMilliseconds = now - postDate.getTime();

  const seconds = Math.floor(differenceInMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 1) return `${days} days ago`;
  if (days === 1) return `1 day ago`;
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return `1 hour ago`;
  if (minutes > 1) return `${minutes} minutes ago`;
  if (minutes === 1) return `1 minute ago`;
  return `now`;
};

export const fetchMetadata = async (url: string) => {
  try {
    const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Failed to fetch metadata");
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const urlRegex = /((http|https):\/\/[^\s]+)/g;
