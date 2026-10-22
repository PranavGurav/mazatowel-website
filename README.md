# MazaTowel Website + Admin Panel

This version refreshes the public website with a clean boutique/D2C visual system based on the MazaTowel logo colours (teal + rose pink), clearer typography, better spacing, and lightweight motion.

## Run on Windows

```powershell
cd D:\mazatowel-website
npm.cmd install
npm.cmd start
```

Or double-click `START-WINDOWS.bat`.

Website: http://localhost:3000
Admin: http://localhost:3000/admin

## React development

The public website and admin panel are now React applications built with Vite.
For production/local serving, `npm.cmd start` builds React into `public/react-build/`
and starts the existing Node API server. For hot-reload development, run
`npm.cmd serve` in one terminal, then `npm.cmd dev` in another; Vite proxies API
and existing static asset requests to the Node server.

## Design refresh

- Public navigation simplified to the high-intent sections: Shop, Designs, Why Personalize, Customers, Reviews, FAQ.
- Public typography uses free Google Fonts: Plus Jakarta Sans + Playfair Display, with system fallbacks.
- Logo remains prominent in the header; it is not repeated across the hero.
- Teal + rose palette is used consistently across buttons, highlights, cards, forms and states.
- Added soft reveal animations, hover motion, floating hero elements and reduced-motion support.
- FAQ remains a real accessible accordion with smooth open/close behavior.
- All icons are inline SVGs; no paid icon package is required.

## Data and uploads

Content lives in `data/` JSON files. Uploaded media lives in `public/uploads/` by type (products, designs, gallery, reviews, customers). The public site reads the same API-backed data used by the admin panel.


## Customer enquiry flow (no WhatsApp login required)
The public customization form collects the customer's name and mobile number and saves the request to `data/enquiries.json`. The admin panel exposes these requests under Customer Enquiries. This is a website enquiry, not a WhatsApp message sent on behalf of the customer. WhatsApp Click-to-Chat still requires an active WhatsApp account; on desktop WhatsApp Web requires a logged-in/linked WhatsApp session.
