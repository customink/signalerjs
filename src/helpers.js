export function defaultDomain(hostname) {
  var hostArray = hostname.split('.');
  return hostArray.length > 2 ? `.${hostArray.slice(1).join('.')}` : hostname;
}

export function daysAfterToday(days) {
  var currentDate = Date.now();
  var msInDay = 24 * 3600 * 1000;
  return (new Date(currentDate + days * msInDay)).toUTCString();
}
