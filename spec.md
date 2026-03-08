# Restaurant App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Public-facing menu page displaying categories (Appetizers, Main Course, Desserts, Drinks) with items, descriptions, and prices
- Online table reservation system: guests can submit name, date, time, party size, and contact info
- Admin panel (login-protected) to manage menu items (add, edit, delete) and view/manage reservations
- Homepage with restaurant name, tagline, hero section, and quick-access links to menu and reservations

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Define data types for MenuItem (id, category, name, description, price, available) and Reservation (id, name, date, time, partySize, phone, status)
2. Backend: CRUD endpoints for menu items (admin-only via authorization)
3. Backend: Create and list reservations; admin can update reservation status (confirmed/cancelled)
4. Backend: Seed sample menu data on first deploy
5. Frontend: Public homepage with hero, highlights, CTA buttons
6. Frontend: Public menu page with category tabs and item cards
7. Frontend: Reservation form page with validation
8. Frontend: Admin dashboard (login required) with menu management table and reservations table
