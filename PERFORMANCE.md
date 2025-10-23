# Performance Optimization Guide

This document summarizes the performance optimizations implemented to improve Core Web Vitals.

## Optimizations Applied

### 1. Font Loading Strategy
**Problem:** External fonts blocking render and contributing to high LCP (3.2s)

**Solutions:**
- Changed `font-display` from `swap` to `optional` to prevent layout shifts and render blocking
- Added `unicode-range` to limit font loading to required characters
- Reduced font preloading from 5 weights to 2 critical weights (regular + bold)
- Added `dns-prefetch` hints before `preconnect` for faster DNS resolution
- Light and italic variants now load on-demand

**Expected Impact:** 
- LCP improvement: 800ms-1200ms reduction
- CLS improvement: No layout shift from font swaps

### 2. Code Splitting
**Problem:** Large initial bundle causing high Total Blocking Time (270ms)

**Solutions:**
- Implemented React.lazy() for dialog components:
  - `EditEventDialog` - lazy loaded
  - `AddEventDialog` - lazy loaded  
  - `OnboardingGuideDialog` - lazy loaded
- Wrapped lazy components in Suspense boundaries
- Added more packages to Next.js `optimizePackageImports`:
  - lucide-react
  - @radix-ui components
  - date-fns

**Expected Impact:**
- Initial bundle size reduction: ~40-60KB
- TBT improvement: 50-80ms reduction
- Faster Time to Interactive (TTI)

### 3. Caching Strategy
**Problem:** No optimal caching for static assets

**Solutions:**
- Disabled production source maps to reduce bundle size
- Configured cache headers in `next.config.mjs`:
  - HTML: `max-age=0, must-revalidate`
  - Static assets: `max-age=31536000, immutable`
  - Fonts: Long-term caching with CORS
- Updated `public/_headers` for Netlify/Cloudflare/Vercel:
  - Removed `Cross-Origin-Embedder-Policy` that blocked external fonts
  - Maintained security headers (CSP, X-Frame-Options, etc.)

**Expected Impact:**
- Repeat visits: 80-90% faster load
- Reduced bandwidth usage
- Better bfcache compatibility

### 4. Critical Rendering Path
**Problem:** Suboptimal resource loading sequence

**Solutions:**
- Added viewport metadata with theme color for instant visual feedback
- Optimized resource hints order: dns-prefetch → preconnect → preload
- Reduced number of render-blocking resources

**Expected Impact:**
- First Contentful Paint (FCP): 100-200ms improvement
- Better perceived performance

## Metrics Goals

| Metric | Before | Target | Expected |
|--------|--------|--------|----------|
| **LCP** | 3.2s | <2.5s | ~1.8-2.0s |
| **FCP** | 0.2s | <1.8s | ~0.2s (good) |
| **TBT** | 270ms | <200ms | ~150-180ms |
| **CLS** | 0 | <0.1 | 0 (maintained) |
| **Speed Index** | 0.4s | <3.4s | ~0.4s (good) |

## bfcache Issues

The bfcache failures shown in your screenshot are **development-only**:
- ❌ WebSocket (Next.js dev server HMR)
- ❌ cache-control: no-store (dev mode)
- ❌ WebSocketUsedWithCCNS (dev mode)

**In production build, these will not occur** as:
- No WebSocket for HMR
- Proper cache-control headers applied
- Static export doesn't use server connections

## Testing & Validation

### Build and Test
```bash
# Build production version
bun run build

# Test locally with production build
bun run serve

# Or use Next.js production mode
bun run start
```

### Measure Performance
1. **Chrome DevTools Lighthouse:**
   - Open DevTools → Lighthouse tab
   - Select "Desktop" or "Mobile"
   - Choose "Performance" category
   - Click "Analyze page load"

2. **PageSpeed Insights:**
   - Visit: https://pagespeed.web.dev/
   - Enter your production URL
   - Compare before/after scores

3. **WebPageTest:**
   - Visit: https://www.webpagetest.org/
   - Test with "Cable" connection
   - Review filmstrip and metrics

### Key Metrics to Monitor
- **Largest Contentful Paint (LCP)** - Should drop from 3.2s to <2.5s
- **Total Blocking Time (TBT)** - Should drop from 270ms to <200ms
- **First Contentful Paint (FCP)** - Should maintain <1.0s
- **Cumulative Layout Shift (CLS)** - Should remain at 0
- **Speed Index** - Should maintain <1.0s

## Additional Recommendations

### Short-term (Quick Wins)
1. ✅ Font optimization - DONE
2. ✅ Code splitting - DONE
3. ✅ Caching headers - DONE
4. ⏳ Image optimization - Consider using responsive images if any are added
5. ⏳ Reduce unused CSS - Already minimal with Tailwind purge

### Long-term (Advanced)
1. Consider self-hosting critical fonts for zero external requests
2. Implement service worker for offline support and advanced caching
3. Add prefetch/preload for predicted navigation patterns
4. Consider edge caching with CDN (Cloudflare/Vercel Edge)
5. Monitor Real User Monitoring (RUM) metrics with tools like:
   - Vercel Analytics
   - Google Analytics Web Vitals
   - New Relic Browser

## Deployment Checklist

- [x] Font loading optimized
- [x] Code splitting implemented
- [x] Cache headers configured
- [x] Security headers maintained
- [x] Production build tested locally
- [ ] Deploy to production
- [ ] Run Lighthouse audit on production URL
- [ ] Monitor Core Web Vitals in Chrome UX Report
- [ ] Check bfcache compatibility (should show 0 failures in production)

## Notes

- **Lint warnings** for Tailwind class names (`shadow-[var(--shadow-xs)]`) are cosmetic suggestions for v4 syntax. They don't affect performance.
- **CSS @-rule warnings** (@custom-variant, @theme, @apply) are expected for Tailwind v4 and don't affect functionality.
- WebSocket bfcache failures are **development-only** and won't appear in production.

## Resources

- [Web.dev - Optimize LCP](https://web.dev/optimize-lcp/)
- [Web.dev - Reduce JavaScript Execution Time](https://web.dev/bootup-time/)
- [Next.js - Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Chrome - Back/forward cache](https://web.dev/bfcache/)
