export function getLoadingMessage(context) {
  const messages = {
    content: 'Loading content...',
    admin: 'Loading admin panel...',
    data: 'Loading data...',
    default: 'Loading...'
  };
  return messages[context] || messages.default;
}

export function getLoadingDelay() {
  return process.env.NODE_ENV === 'development' ? 1000 : 0;
}