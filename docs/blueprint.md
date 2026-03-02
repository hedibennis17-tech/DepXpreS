# **App Name**: FastDép Connect

## Core Features:

- Geo-Zone Product Catalog: Display a dynamic catalog of categories and products available from the assigned dépanneur based on the client's GPS-detected zone. Products include images, names, formats, prices, and simple stock indicators.
- Shopping Cart & Secure Checkout: Allow clients to add/remove products, view a detailed order summary (items, subtotal, delivery fees, taxes, tips, promotions), and complete payments securely using Stripe for credit card processing.
- Real-time Order Tracking: Provide synchronized real-time order status updates and GPS location tracking for clients, drivers, and administrators, displaying the dépanneur and driver position on a map.
- Driver Onboarding & Management: Enable drivers to sign up through a 4-step wizard (personal details, vehicle info, document uploads via Firebase Storage, and confirmation) and manage their online/offline status via a dedicated dashboard.
- Smart Dispatcher Tool: An AI-powered Cloud Function automatically assigns the closest available and eligible driver to new orders, optimizing for estimated time of arrival (ETA) and current driver status.
- Admin Command Center: A comprehensive SaaS-style dashboard for administrators to monitor all orders, manage client and driver accounts, maintain product listings, configure zones, and access operational KPIs.
- Flexible Authentication & User Profiles: Implement client, driver, and admin authentication via email/password, Google, Apple, and OTP (SMS/email via Twilio). Users can manage their profiles, addresses, and payment methods securely.

## Style Guidelines:

- Primary action color: A deep, energetic red (#C60A34) to signify speed, urgency, and action, aligning with 'express delivery' and drawing from a modern SaaS aesthetic.
- Background color: A very subtle, warm off-white (#F9F0F3) providing a clean, modern, and inviting canvas that gently hints at the primary red while maintaining a light theme.
- Accent color: A rich, contrasting plum (#731755) to be used for secondary calls to action or distinct UI elements, offering depth and sophistication.
- Headlines and body text font: 'Inter' (sans-serif) for its modern, clean, and highly legible appearance across all user interfaces, from client-facing content to professional dashboards.
- Utilize a consistent set of sleek, modern line icons for navigation and functional elements across all applications, supporting a professional and intuitive user experience.
- Client Desktop Layout: Features a 3-column structure (24% left for address/summary, 46% center for categories/products, 30% right for GPS map). Categories are presented broadly, and the cart is integrated.
- Client Mobile Layout: A sticky header for address, reduced map often in a drawer or at the top, horizontally scrollable categories, product listings in a 2-column grid, and a sticky bottom cart for easy access.
- Driver Application: A clean, multi-step wizard for onboarding and a professional dashboard for order management and status updates. Admin Dashboard: Features a dark sidebar for navigation and prominent KPI cards on a centralized view, similar to the GoCab interface.
- Subtle, fluid animations and transitions throughout the application to enhance user interaction, provide instant feedback on actions (e.g., adding to cart), and indicate real-time status changes.