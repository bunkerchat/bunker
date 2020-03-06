export const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
export const isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
export const isMobile = isIOS || isAndroid;
