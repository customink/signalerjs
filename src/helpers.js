export function defaultDomain(hostname) {
  const hostArray = hostname.split('.');
  return hostArray.length > 2
    ? `.${hostArray.slice(hostArray.length-2).join('.')}`
    : `.${hostname}`;
}

export function daysAfterToday(days) {
  const currentDate = Date.now();
  const msInDay = 24 * 3600 * 1000;
  return new Date(currentDate + days * msInDay).toUTCString();
}
