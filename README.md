# Fake Form Filler

A Chrome/Chromium extension (also works on Edge, Brave, etc.) that fills out
web forms with fake but realistic-looking personal details — useful for
testing forms without typing dummy data by hand every time.

**Email and password fields are never touched.**

## What it fills in

- First name, last name, full name
- Address, city, ZIP/postal code, state
- Phone number
- Company name
- Date of birth
- Radio buttons (one random choice per group) and checkboxes (randomly checked)

All values generated on a page are consistent with each other (the same
name and city are reused everywhere they're needed on that page).

## Installation (developer mode)

1. Download and unzip this folder onto your computer.
2. Open Chrome (or Chromium/Edge/Brave) and go to `chrome://extensions`.
3. Turn on **"Developer mode"** (toggle in the top-right corner).
4. Click **"Load unpacked"**.
5. Select the `fake-form-filler` folder.
6. The extension icon will appear in the toolbar (it may be hidden under
   the puzzle-piece icon 🧩 — click that and pin it for easy access).

## How to use it

1. Go to the page with the form you want to fill (e.g. a sign-up form).
2. Click the extension icon.
3. Click **"Fill the form"** — recognized fields are filled in with matching data.

## Notes and limitations

- Doesn't work on fields inside a closed Shadow DOM.
- On native `<select>` dropdowns, it tries to match the generated data to
  an option's text; if nothing matches, it picks a random option.
- Doesn't handle "custom" dropdowns built with `<div>`s/JavaScript (not
  native `<select>` elements).
- Radio buttons and checkboxes are clicked at random — including things
  like "I agree to the terms" — so always double-check before submitting
  a real form.
- Intended for personal/testing use only. Only use it on sites where
  entering fake data is appropriate (e.g. test accounts, non-binding
  sign-ups). Don't use it to get around identity verification that
  requires real information.
