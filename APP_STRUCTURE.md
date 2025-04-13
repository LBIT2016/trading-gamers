# Trading Gamers Application Structure

## Directory Structure
```
/apps/trading-gamers/
├── src/
│   ├── components/   # Reusable UI components
│   ├── stores/       # State management
│   ├── modules/      # Business logic & services
│   ├── views/        # Page layouts
│   └── ...
├── server/          # Backend API proxy
└── ...
```

## Components (`/src/components/`)
- Pure UI components with only internal state
- Use Tailwind for styling
- Each component in its own folder with `index.tsx`
- Export typed prop definitions
- Example structure:
```
/components
├── Button/
│   └── index.tsx
├── Card/
│   └── index.tsx
└── Counter/
    └── index.tsx
```

### Component Guidelines
- Use explicit TypeScript types for props
- Include JSDoc documentation
- Follow single responsibility principle
- Use semantic HTML elements
- Implement proper accessibility features

## Stores (`/src/stores/`)
- State management using Zustand
- Explicit interfaces for state and actions
- Single responsibility focus
- Group related actions with state
- Split state into logical groups (ui, validation, data)

### Store Structure
```typescript
interface State {
  data: any;
  ui: {
    isLoading: boolean;
    // ...other UI state
  };
  validation: {
    errors: string[];
    // ...other validation state
  };
}

interface Actions {
  // Action methods that modify state
}

type Store = State & Actions;
```

## Modules (`/src/modules/`)
- Business logic and external service integration
- Handle IO operations (API calls, file operations)
- Strong typing required
- Error handling and retry logic
- Configuration management

### Module Guidelines
- Focus on single functionality
- Handle edge cases
- Transform API errors
- Use environment variables for sensitive data
- Include comprehensive type definitions

## Views (`/src/views/`)
- Page layouts and component composition
- Use existing components only
- Semantic HTML and Tailwind
- Explicit TypeScript types
- State management rules:
  - Synchronized state: Use stores
  - Local state: Use useState
  - External functionality: Use modules

## Server (`/server/`)
- API proxy functionality
- CORS handling
- Credential storage
- Request/response transformation
- Required `/ping` endpoint
- Environment-based configuration

### Server Features
- Proxy external API requests
- Store sensitive credentials
- Transform requests/responses
- Health check endpoints
- Local resource access

## Global Guidelines

### Node Modules
- Check `package.json` before using external modules
- Avoid arbitrary module usage
- Document module dependencies

### TypeScript
- Use explicit types throughout
- Avoid `any` and `unknown`
- Document with JSDoc comments
- Use interfaces for data structures

### State Management Hierarchy
```
Views (pages)
  ↓
Stores (application state)
  ↓
Modules (business logic)
  ↓
Server (API proxy)
```

### Best Practices
- Follow single responsibility principle
- Use semantic naming
- Implement proper error handling
- Keep code modular
- Document key functionality
- Use Tailwind for styling
- Follow accessibility guidelines
- Implement proper testing

### Development Workflow
1. Build pure UI components
2. Implement state management
3. Add business logic
4. Compose views
5. Integrate API endpoints

## Synchronization
- Use keepsync library for data synchronization
- Follow keepsync patterns and examples
- Handle offline capabilities
- Manage conflict resolution

## Documentation
- Use JSDoc comments
- Document component props
- Include usage examples
- Maintain type definitions
- Add inline comments for complex logic

This structure ensures:
- Clear separation of concerns
- Type safety
- Maintainable codebase
- Efficient state management
- Component reusability
- Secure external service handling
