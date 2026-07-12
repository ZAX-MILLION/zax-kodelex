export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes === 1) return '1 minute';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) return '1 hour';
  if (diffInHours < 24) return `${diffInHours} hours`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return '1 day';
  if (diffInDays < 7) return `${diffInDays} days`;
  
  return date.toLocaleDateString();
};