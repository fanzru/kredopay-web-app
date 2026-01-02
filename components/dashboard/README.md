# Dashboard Components - Clean Code Architecture

This directory contains the refactored dashboard components following clean code principles and best practices.

## 📁 Directory Structure

```
dashboard/
├── components/          # Reusable UI components
│   ├── ActionModal.tsx
│   ├── BalanceHeader.tsx
│   ├── CompactActionButton.tsx
│   ├── PermissionCard.tsx
│   ├── StatusBanner.tsx
│   ├── TransactionItem.tsx
│   └── index.ts        # Component exports
├── constants/          # Static data and configuration
│   ├── menuItems.ts
│   └── mockData.ts
├── hooks/             # Custom React hooks
│   └── useOverviewData.ts
├── layout/            # Layout components
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/             # Page components
│   ├── Overview.tsx
│   ├── Identity.tsx
│   ├── LiquidityFog.tsx
│   ├── Permissions.tsx
│   ├── ProofHistory.tsx
│   ├── ProtocolSettings.tsx
│   └── SpendingIntents.tsx
├── services/          # Business logic and API calls
│   └── storage.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Helper functions
    └── helpers.ts
```

## 🎯 Key Improvements

### 1. **Separation of Concerns**
- **Components**: Pure UI components focused on presentation
- **Hooks**: Business logic and state management
- **Services**: Data access and external interactions
- **Utils**: Reusable helper functions
- **Types**: Centralized type definitions

### 2. **Reusability**
- Extracted common UI patterns into reusable components
- Created shared constants to avoid duplication
- Implemented utility functions for common operations

### 3. **Maintainability**
- Single Responsibility Principle: Each file has one clear purpose
- DRY (Don't Repeat Yourself): Eliminated code duplication
- Clear naming conventions and file organization

### 4. **Type Safety**
- Centralized TypeScript types in `types/index.ts`
- Proper interfaces for all component props
- Type-safe utility functions

## 🔧 Usage Examples

### Importing Components
```tsx
import { BalanceHeader, CompactActionButton } from "../components";
```

### Using Custom Hooks
```tsx
import { useOverviewData } from "../hooks/useOverviewData";

function MyComponent() {
  const { cards, balance, handleCreateCard } = useOverviewData();
  // ...
}
```

### Using Storage Service
```tsx
import { StorageService } from "../services/storage";

// Get cards
const cards = StorageService.getCards();

// Save cards
StorageService.saveCards(updatedCards);
```

### Using Utilities
```tsx
import { formatCurrency, calculateTotalBalance } from "../utils/helpers";

const total = calculateTotalBalance(cards);
const formatted = formatCurrency(total);
```

## 📝 Component Documentation

### Core Components

#### `BalanceHeader`
Displays the main balance with ZK-proof count and change indicators.

**Props:**
- `balance: number` - The total balance to display
- `proofCount?: number` - Number of ZK proofs (default: 254)
- `changeAmount?: number` - Amount of change (default: 0.01)
- `changePercentage?: number` - Percentage change (default: 0.31)

#### `CompactActionButton`
A compact button for quick actions (Send, Swap, Receive, Pay).

**Props:**
- `icon: LucideIcon` - The icon component to display
- `label: string` - Button label text
- `onClick: () => void` - Click handler

#### `PermissionCard`
Displays a permission/card with balance and details.

**Props:**
- `card: Card` - Card object containing id, name, balance, etc.

#### `TransactionItem`
Displays a single transaction in the recent activity list.

**Props:**
- `transaction: Transaction` - Transaction object

#### `ActionModal`
Modal for creating cards and executing actions.

**Props:**
- `activeAction: ActionType` - Current active action
- `onClose: () => void` - Close handler
- `newCardName: string` - Card name input value
- `onCardNameChange: (name: string) => void` - Input change handler
- `onCreateCard: () => void` - Create card handler

## 🚀 Best Practices

1. **Always use TypeScript types** from `types/index.ts`
2. **Use StorageService** instead of direct localStorage calls
3. **Extract reusable logic** into custom hooks
4. **Keep components small** and focused on one responsibility
5. **Use utility functions** for formatting and calculations
6. **Import from index files** for cleaner imports

## 🔄 Migration Guide

If you're updating existing code to use the new structure:

1. Replace inline types with imports from `types/index.ts`
2. Replace localStorage calls with `StorageService` methods
3. Extract repeated UI patterns into components
4. Move business logic to custom hooks
5. Use utility functions for formatting and calculations

## 📚 Further Reading

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
