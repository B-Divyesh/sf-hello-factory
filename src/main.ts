import './style.css';
import { formatProductSummary, products } from './products';

const clock = document.querySelector<HTMLTimeElement>('#factory-clock');
const buildTime = document.querySelector<HTMLTimeElement>('#build-time');
const summary = document.querySelector<HTMLElement>('#product-summary');
const utcClock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' });
const buildFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' });

function updateClock(): void {
  if (!clock) return;
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = utcClock.format(now);
}

if (buildTime) {
  const builtAt = new Date(__BUILD_TIMESTAMP__);
  buildTime.dateTime = builtAt.toISOString();
  buildTime.textContent = buildFormatter.format(builtAt);
}
if (summary) summary.textContent = formatProductSummary(products);
updateClock();
window.setInterval(updateClock, 1000);
