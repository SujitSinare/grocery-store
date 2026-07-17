# Developer & Maintenance Handoff Guide

This document provides architectural blueprints and instructions to help developers smoothly extend, modify, or debug the Multi-Store SaaS Grocery Store Management System in the future.

---

## 1. System Architecture Map

The project is structured to keep clean separation between NestJS backend layers and Angular standalone UI layouts:

```
├── backend/                  # NestJS API (Port 3000)
│   ├── src/
│   │   ├── main.ts           # Bootloader (helmet, Swagger, prefix, validation)
│   │   ├── app.module.ts     # Master Module
│   │   └── modules/          # Business Logic
│   │       ├── auth/         # JWT Passport Strategies, Guards, Interceptors
│   │       ├── database/     # DB connections and seeders
│   │       └── [feature]/    # e.g., orders, inventory, reports
│   │           ├── schemas/  # Mongoose Schemas
│   │           ├── *.service.ts
│   │           ├── *.controller.ts
│   │           └── *.module.ts
│   └── uploads/              # Local file backups (git-ignored)
│
└── frontend/                 # Angular Standalone App (Port 4200)
    ├── src/
    │   ├── main.ts           # Application Bootstrapper
    │   ├── styles.css        # Glassmorphism utilities & Tailwind imports
    │   ├── assets/i18n/      # English (en.json) & Marathi (mr.json) files
    │   └── app/
    │       ├── app.config.ts # Providers (HttpClient, Translate, Routes)
    │       ├── app.routes.ts # Functional lazy-loaded routing and Role guards
    │       ├── core/
    │       │   ├── guards/   # auth.guard.ts, role.guard.ts
    │       │   ├── signals/  # Signals state (auth.store, cart.store, theme.store)
    │       │   └── interceptors/ # api.interceptor (Header tags injections)
    │       └── modules/      # Page components
    │           └── [feature]/
    │               ├── *.component.ts   # Logic classes
    │               └── *.component.html # HTML markup
```

---

## 2. Step-by-Step: Adding a New Feature (e.g., "Wallet")

If you need to add a new operational feature (like a customer wallet or discount coupons), follow this standard blueprint:

### Step 2.1: Extend the Backend (NestJS)
1. **Create the Schema**:
   Inside `backend/src/modules/[feature]/schemas/[feature].schema.ts`, define the Mongoose schema:
   ```typescript
   @Schema({ timestamps: true })
   export class Wallet {
     @Prop({ type: Types.ObjectId, ref: 'User', required: true })
     userId: Types.ObjectId;
     @Prop({ required: true, default: 0 })
     balance: number;
   }
   ```
2. **Create the Service**:
   Write queries and computations in `wallet.service.ts`.
3. **Create the Controller**:
   Add endpoints with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('customer')` in `wallet.controller.ts`.
4. **Wire the Module**:
   Register controllers and providers in `wallet.module.ts`, then import `WalletModule` into `app.module.ts`.

### Step 2.2: Extend the Frontend (Angular)
1. **Create Component & Template**:
   Under `frontend/src/app/modules/[feature]/`, create two files:
   - `wallet.component.ts` (Logic class referencing `templateUrl: './wallet.component.html'`)
   - `wallet.component.html` (Markup with Tailwind layout grid)
2. **Configure Routing**:
   Open [app.routes.ts](file:///d:/Sujit/grocery-store/frontend/src/app/app.routes.ts) and add the path with appropriate guards:
   ```typescript
   {
     path: 'wallet',
     loadComponent: () => import('./modules/wallet/wallet.component').then(m => m.WalletComponent),
     canActivate: [authGuard]
   }
   ```
3. **Add Navigation Link**:
   In [app.component.ts](file:///d:/Sujit/grocery-store/frontend/src/app/app.component.ts), add a sidebar link check matching your user role:
   ```html
   <a routerLink="/wallet" routerLinkActive="bg-green-500 text-white shadow-md">
     <span class="material-icons">account_balance_wallet</span>
     <span>Wallet</span>
   </a>
   ```

---

## 3. Extending Translations & Themes

### 3.1 Adding a Bilingual Word (English / Marathi)
1. Open [en.json](file:///d:/Sujit/grocery-store/frontend/src/assets/i18n/en.json) and add the key:
   ```json
   "WALLET": "My Wallet"
   ```
2. Open [mr.json](file:///d:/Sujit/grocery-store/frontend/src/assets/i18n/mr.json) and add the Marathi value:
   ```json
   "WALLET": "माझे वॉलेट"
   ```
3. Use the translate pipe in any HTML template:
   ```html
   <h1>{{ 'COMMON.WALLET' | translate }}</h1>
   ```

### 3.2 Accessing UI Dark Theme
Tailwind dark mode class selector is globally bound to `ThemeStore`. If you need custom styles for dark mode in HTML, prefix the class with `dark:`:
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
```

---

## 4. Verification Checklists

Before committing any modifications:
1. **Lint & Format**: Run `npm run lint` and `npm run format` inside the backend root.
2. **Build Test**: Run `npm run build` in both directories to verify there are no TypeScript compile or binding errors.
3. **Database Health**: Ensure Mongoose references target valid schema registrations to prevent database query errors on startup.
