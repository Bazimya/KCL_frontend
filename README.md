# Kigali Coffee Lab (KCL): Frontend

GitHub repository: `KCL_frontend`.

React + Vite + Tailwind storefront and admin panel for Kigali Coffee Lab - order
coffee, food, or a coffee machine, and apply for barista training, all with **no
customer registration**. Staff/Admin sign in separately to run the shop.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
```

The dev server proxies `/api` and `/uploads` to `http://localhost:5050` (the backend's
default port, see `KCL_backend/.env_example`), see `vite.config.js`. Make sure the backend
is running and seeded (`npm run seed` in the backend folder) before you start. If your
backend runs on a different port, update the proxy `target` in `vite.config.js`.

## Production deployment

1. Set the backend's public origin **at build time** (Vite bakes it into the
   bundle). In the host's build environment, or a `.env.production` file:
   ```
   VITE_API_URL=https://api.yourdomain.com
   # optional, defaults to VITE_API_URL:
   # VITE_UPLOADS_URL=https://api.yourdomain.com
   ```
   `npm run build` refuses to run without `VITE_API_URL`.
2. Build: `npm ci && npm run build` and serve the `dist/` folder.
3. **SPA fallback is required.** Every route (e.g. `/t/<qrToken>` from the
   table QR stickers, `/admin/orders`) must serve `index.html`. Included:
   - Netlify / Cloudflare Pages: `public/_redirects` (copied into `dist/`)
   - Vercel: `vercel.json`
   - nginx: see `nginx.conf.example` (`try_files $uri $uri/ /index.html`)
4. Serve over **HTTPS** - the in-browser QR camera scanner only works on a
   secure origin.
5. Add this site's exact origin to the backend's `FRONTEND_URL`.

## Default staff logins (from backend seed script)

| Role    | Email                          | Password     |
|---------|---------------------------------|--------------|
| Admin   | admin@kigalicoffeelab.com        | Admin@12345   |
| Manager | manager@kigalicoffeelab.rw      | Manager@123  |

Customers never see or need this - only staff running the shop sign in, via the
small gold floating button in the bottom-right corner (or `/login` directly).

## How ordering works (no account, ever)

1. Browse Coffee, Food, or Machines - a cart and wishlist are kept in the browser's
   local storage (`src/context/CartContext.jsx`, `src/context/WishlistContext.jsx`),
   no server round-trip until checkout.
2. At Checkout, coffee/food orders ask "I'm at the shop" (pick a table, live from
   `GET /tables`) or "Ordering from home" (pickup, no table). A machine-only cart
   asks for a delivery address instead - the backend never allows food/coffee to be
   delivered, only picked up or eaten in.
3. Payment is Cash, MoMo Pay, or MoMo Code (whichever an Admin has enabled in
   Admin, Settings) - MoMo orders can upload a screenshot as proof right after
   checkout, or later from Track Order.
4. Placing an order returns a public **order code** (e.g. `KCL-482131`) - that's
   the whole "account" a customer needs. `src/pages/TrackOrder.jsx` looks any order
   up by that code and polls for status - nothing here requires a login.

## The app shell

- **Bottom tab bar** (`src/components/BottomNav.jsx`), fixed on every screen size so
  the web app behaves like the mobile app: **Menu** (home), **Coffee**, **Food**,
  **Machine** (the coffee-machine shop), **Barista** (training info + apply).
- **Admin/Staff button** (`src/components/AdminFab.jsx`), a small floating button in
  the bottom-right corner, above the tab bar - deliberately out of the way of the
  customer flow, but always there for staff.
- **Top bar** (`src/components/Navbar.jsx`) carries branding, search, the theme
  toggle, and cart/wishlist icons; a "More" menu covers About/Mission & Vision/Contact.

## Structure

- `src/context`: Auth (staff-only), Cart (guest, local), Wishlist (guest, local),
  Settings, Theme
- `src/pages`: Home, Coffee/Food (`MenuCategory.jsx`, one component, two categories),
  Shop + ProductDetail (machines), Barista + BaristaApply, Cart, Checkout, TrackOrder,
  Wishlist, About, MissionVision, Contact, Login (staff only)
- `src/pages/admin`: role-gated admin/manager panel - Dashboard, Products, Drinks
  (with a Coffee/Food type selector), Orders, Barista Training, Users and Roles,
  Settings (Cash/MoMo Pay/MoMo Code toggles)
- `src/components`: BottomNav, AdminFab, Navbar, Footer, ProductCard (auto-rotating
  photo carousel), DrinkCard (with its own add-to-cart), Pagination, CategoryDropdown,
  admin route guards
- `src/utils/idHash.js`: mirrors `backend/utils/idHash.js` exactly, so the storefront
  can build obfuscated `/product/<hash>` links locally without a round trip to the API

## Roles in the UI

- **Admin** sees every admin nav item and can create Manager/Admin accounts with
  fine-grained permissions.
- **Manager** only sees the admin sections they've been granted (`viewDashboard`,
  `manageProducts`, `manageDrinks`, `manageOrders`, `manageBarista`, `manageUsers`,
  `manageSettings`, `manageTables`).
- **Guest/Customer** has no account at all - browses, adds to a local cart/wishlist,
  checks out, tracks their order by code, and applies for barista training.

## Search and pagination

The navbar search icon opens a live search modal (machines, categories) that redirects
straight to the matching product's hashed detail page. Every admin listing has its own
search field, category filter where relevant, and a rounded pagination control.

## Themes

A theme toggle (moon/sun icon) in the navbar switches between the default coffee
theme (espresso browns + gold) and a cool blue theme, persisted in local storage
and applied via CSS variables (`src/index.css`) - so every background across the
app stays a deliberate, on-theme color rather than plain white.

## Verified this session

Booted a live backend (MariaDB + Prisma) alongside this frontend and exercised the
full guest flow through the actual Vite proxy: browsed the Coffee and Food menus,
loaded the table list, placed a dine-in coffee order (no login), tracked it by its
order code, had a logged-in Admin advance its status, and confirmed the guest saw
the update. Also verified a food pickup order (no table), a machine delivery order,
and that forcing a coffee/food order to `delivery` is correctly rejected by the
backend. `npm run build` completes cleanly.

## What's new in this update

- **Course section**: a nested "Course" mega-dropdown in the navbar (Coffee Therapy,
  Coffee Experience, Coffee Training, the last flying out to Barista/Cupping/
  Roasting/CVA), animated in from the bottom. `/course` is the mobile-friendly hub page.
- **Coffee Training**: each of the 4 courses has its own page with a live countdown to
  its cohort's application deadline, seat tracking, and (for the 3 global-certificate
  courses) Foundation/Intermediate/Professional level tabs.
- **History**: `/history` shows employee stories (photo one side, text the other,
  alternating), with a "Read more" modal and photo gallery for longer stories.
- **QR table ordering**: `/t/:qrToken` is what a phone lands on after scanning a table's
  sticker. A `TableContext` then carries that table through to Checkout, where it's
  locked in (not manually re-pickable) instead of the usual table picker.
- **Table booking**: `/book-table` lets anyone reserve one or more tables ahead of time.
- **Bottom nav restructured**: Menu / Coffee / Course / Machine / More, with More
  expanding to Food, History, Track Order, and Reserve a Table.
- Admin: `Training` (cohort + application management per course/level), `History`
  (story + gallery CRUD), and `Tables` (QR download, now with a Bookings tab).

All of the above was verified in a real headless browser (Playwright), not just built:
login, every new public page, the full scan-table-with-pending-order-blocks flow, the
booked-soon warning, a complete scan-to-checkout order placing with the table correctly
locked in, and the admin QR sticker download actually triggering and producing a valid file.

## Dine-in QR prompt (latest update)

A modal nudges customers to scan their table's QR code whenever they reach
something that's "taken at a table", coffee or food, but never on the
machine shop, Coffee Training, or anywhere else unrelated to dine-in:

- Triggers on landing on the dedicated `/coffee` or `/food` pages, and on
  scrolling into the Coffee or Food sections on the Home page (never the
  Machines section).
- If the customer has no order in progress, it prompts them to scan the QR
  code on their table (with a "Reserve a table instead" fallback).
- If they already have an active order (tracked via the same order-code
  localStorage key Checkout/TableScan use), it shows that order's live
  tracking steps, ETA countdown, and track ID instead of nagging them to scan.
- Shows once per page visit (de-duplicated across Home's two sections),
  and is skipped entirely if they've already scanned a table and are mid-order.

See `src/context/DineInPromptContext.jsx`, `src/components/DineInPromptModal.jsx`,
and `src/hooks/useInViewOnce.js`. Verified in a real browser: triggers correctly
on Coffee/Food, stays silent on Machine/Training even with an active order
sitting in the background, and shows only once per visit.

### In-browser camera QR scanning

The "Scan QR Code Now" button opens a live camera scanner right in the browser
(`src/components/QrScannerModal.jsx`, via the `html5-qrcode` package) - no app
install needed. It decodes the table's sticker, pulls out the `/t/:qrToken`
path, and navigates straight there. Rejects anything that isn't a KCL table
QR code with a friendly message instead of navigating somewhere unexpected.

This was verified end-to-end with a real QR code fed through a simulated
camera in an actual browser: a valid table's QR correctly opens that table's
page (including its live "reserved soon" warning), and an unrecognised QR
correctly shows "Table Not Found". **Camera access requires HTTPS in
production** (browsers block camera access on plain HTTP, `localhost` is
exempted for development) - make sure your deployed frontend is served over
HTTPS before printing any table stickers.

## Order code search input (latest update)

Track Order's search field now shows "KCL-" as a fixed, non-editable prefix
(`src/components/OrderCodeInput.jsx`) - the customer only ever types the
digits. Matches the backend's new sequential `KCL-0000001`-style codes.

## Scan-first checkout, "Not now" snooze, and admin analytics (latest update)

- **Checkout no longer has a manual table picker.** If the cart has
  coffee/food and no table has been scanned yet, a `DineLocationModal`
  asks "Where are you right now?" - choosing "I'm at Kigali Coffee Lab"
  opens the real camera scanner (`QrScannerModal`) right there; choosing
  "I'm ordering from home" proceeds as a pickup order. Once a table IS
  scanned, Checkout shows only a minimal "Ordering at Table X" card - no
  leftover toggle or picker UI.
- **`TableScan.jsx`** now returns to `/checkout` (not `/coffee`) after a
  scan if the cart already has items, so scanning mid-checkout feels
  seamless rather than sending the customer back to browse the menu.
- **Dine-in prompt "Not now"**: the scan-nudge modal has a "Not now"
  button that snoozes it for 30 minutes (`DineInPromptContext`), cleared
  automatically the moment a table is actually scanned.
- **Fixed a real crash**: `QrScannerModal` was calling `scanner.stop()`
  unconditionally on close, which throws if the camera never
  successfully started (no camera, permission denied) - this crashed the
  whole page. Now it only stops a scanner that actually started.
- **Admin sidebar** shows a count badge on every nav item (Coffee
  Machines, Drinks Menu, Orders, Tables & Bookings, Coffee Training,
  History, Users & Roles), from the new `/dashboard/nav-counts` endpoint.
- **Admin Orders page**: clickable analytics cards for Today/Yesterday/
  This Week/This Month/This Year/Lifetime (also filter the table below),
  the status filter dropdown is grouped by order flow (Dine-in/Pickup vs
  Delivery), and each row's status shows a green check (Served/Delivered),
  red X (Cancelled), or clock (in progress) icon alongside the dropdown.

All of the above was verified in a real browser, including the full
scan-at-checkout path with an actual decoded QR code (via a simulated
camera feed) returning to Checkout with the right table attached, and the
order landing in the database with the correct table and type.

## Navigation polish + admin Reports page (latest update)

- **Scroll-to-top on navigation** (`src/components/ScrollToTop.jsx`):
  every route change now scrolls to the top, like a fresh page load -
  verified by scrolling deep into a page, navigating, and confirming the
  new page lands at the top.
- **Home page section order**: Featured Coffee Machines now shows first,
  then Coffee Menu, then Food Menu.
- **Book Table** (`/book-table`): every field label now has an icon
  (Name, Phone, Party Size, Duration, Date, Time, Notes).
- **Admin Reports page** (`/admin/reports`, `manageReports` permission):
  one card per period (Today/Yesterday/This Week/This Month/This
  Year/Lifetime), each with its own PDF download button. Uses the same
  blob-download pattern as the table QR sticker download. Verified with
  a real browser button click producing an actual, correctly-contented
  PDF file.

## Custom date reports (latest update)

The admin Reports page now has a "Custom Date" section below the preset
period cards, with a toggle between **Single Date** and **Date Range** -
each downloads the same kind of PDF, just filtered to exactly the day(s)
picked instead of a preset period.

## Live orders, overdue tracking, nav icons (latest update)

- **Report date pickers** are now bounded: nothing after today, nothing
  before the first order ever placed (`firstOrderDate` from
  `/orders/stats`).
- **Admin Orders page rebuilt as cards** (no more table): defaults to
  "Today" on open, each card's border colour reflects its status, and
  any order not yet Served/Delivered/Cancelled gently pulses
  ("heartbeat") - the moment it's marked Served/Delivered the pulse stops
  and a green check badge appears top-right; Cancelled stops it too with
  a red X badge instead.
- **Live new-order alerts**: the Orders page polls for brand-new orders
  every 8 seconds. A new one plays a short two-tone chime (synthesised in
  the browser, no audio file needed) and pops a clickable toast
  top-right ("New order placed! KCL-000000X · amount") - clicking it
  opens that exact order's details.
- **Overdue order tracking**: once a customer's ETA passes,
  `EtaCountdown` doesn't just stop - it counts back up in red with a
  calming message ("Still coming right up, hang tight!" / similar),
  instead of silently freezing at zero.
- **Navbar icons**: the admin/login icon is now a person icon (was a
  shield), and there's a dedicated Track Order icon next to Search.

Verified live: placed a real order via the API while the admin page was
open and polling, and watched the toast, sound trigger, and card all
appear within one poll cycle; confirmed clicking the toast opens the
right order; confirmed the overdue counter actually counts up in red
with a database-backdated ETA (not just written and assumed correct).

## Reservation blocking + photo lightbox (latest update)

- **TableScan** (`/t/:qrToken`) now has three distinct states instead of
  one "warning": a clean ordering flow with no booking nearby; a warning
  with a live countdown when a reservation is 30-60 minutes out
  (ordering still works); and a full block - no "Start Ordering" button
  at all, just a live countdown and a prompt to pick another table - when
  a reservation is under 30 minutes out or already underway.
- **History page photo lightbox** (`src/components/PhotoLightbox.jsx`):
  the cover photo on each story card, the "N more photos" link, and every
  gallery thumbnail inside the "Read more" modal are all now clickable,
  opening a full-screen viewer with previous/next buttons, left/right
  arrow key navigation, wraparound cycling, and a position counter.

Verified live: the countdown on TableScan actually ticks down
second-by-second; the lightbox was tested with a real 4-photo gallery -
confirmed it opens at the right photo from every entry point (cover,
"more photos" link, any individual thumbnail), cycles forward and
wraps back to the first photo, responds to arrow keys, and Escape closes
only the lightbox without also closing the story modal underneath it.
