export const LP_VARIANT = "smartfit-a";
export const YANDEX_METRIKA_ID = 114674342;

export const TRACKING_BOOTSTRAP = `
  window.FB_LP = { variant: ${JSON.stringify(LP_VARIANT)}, debug: false };

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  gtag('consent', 'default', {
    ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted'
  });
  gtag('js', new Date());
  gtag('set', { lp_variant: window.FB_LP.variant });
  gtag('config', 'G-XBVGTE635G', { lp_variant: window.FB_LP.variant });
  gtag('config', 'AW-863236948');
  (function() {
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=G-XBVGTE635G';
    document.head.appendChild(tag);
  })();

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '258016955490147');
  fbq('track', 'PageView');

  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","i589iloenb");
  clarity('set', 'lp_variant', window.FB_LP.variant);

  (function (scriptUrl) {
    var ym = window.ym = window.ym || function () {
      (ym.a = ym.a || []).push(arguments);
    };
    ym.l = Date.now();
    if (Array.from(document.scripts).some(function (script) {
      return script.src === scriptUrl;
    })) return;

    var tag = document.createElement('script');
    tag.async = true;
    tag.src = scriptUrl;
    document.head.appendChild(tag);
    ym(${YANDEX_METRIKA_ID}, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      referrer: document.referrer,
      url: window.location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  })('https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}');
`;

const ATTRIBUTION_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_adset",
  "utm_ad", "fbclid", "gclid", "gbraid", "wbraid",
];
const ATTRIBUTION_STORAGE_KEY = "fb_lp_params";

function readAttribution() {
  const attribution: Record<string, string> = {};
  if (typeof window === "undefined") return attribution;
  const current = new URLSearchParams(window.location.search);
  let saved: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? "{}");
    if (parsed && typeof parsed === "object") saved = parsed;
  } catch {
    // Checkout still works when storage is unavailable.
  }

  for (const key of ATTRIBUTION_KEYS) {
    const value = current.get(key) || saved[key];
    if (typeof value === "string" && value) {
      attribution[key] = value;
    }
  }
  return attribution;
}

export function captureAttribution() {
  if (typeof window === "undefined") return;
  const attribution = readAttribution();
  if (!Object.keys(attribution).length) return;
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Checkout can still read parameters from the current URL.
  }
}

export function appendCheckoutAttribution(query: URLSearchParams) {
  query.set("attributes[lp]", LP_VARIANT);
  for (const [key, value] of Object.entries(readAttribution())) query.set(key, value);
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const META_EVENTS = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
} as const;

type TrackingItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

export function trackEcommerce(event: keyof typeof META_EVENTS, items: TrackingItem[]) {
  if (typeof window === "undefined") return;
  const details = {
    currency: "TRY",
    value: items.reduce((total, item) => total + item.price * item.quantity, 0),
    lp_variant: LP_VARIANT,
  };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ecommerce: { ...details, items } });
  window.gtag?.("event", event, { ...details, items });
  window.fbq?.("track", META_EVENTS[event], {
    ...details,
    content_type: "product",
    content_ids: items.map((item) => item.item_id),
    content_name: items.map((item) => item.item_name).join(", "),
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
  }, { eventID: `${event}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}` });
  if (event === "begin_checkout") window.clarity?.("event", "checkout_click");
}

export function trackLandingStep(event: string, params: Record<string, unknown>) {
  const details = { ...params, lp_variant: LP_VARIANT };
  window.gtag?.("event", `lp_${event}`, details);
  window.fbq?.("trackCustom", `LP_${event}`, details);
  window.clarity?.("event", event);
}
