export function getApiUrl() {
  const domain = window.location.hostname;
  const domainParts = domain.split('.');
  if (domainParts[0] === 'www') {
    return `https://api.${domainParts.slice(1).join('.')}`;
  } else {
    return `https://api.${domain}`;
  }
}