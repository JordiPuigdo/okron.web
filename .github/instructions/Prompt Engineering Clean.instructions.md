# Chat Instructions

## UI/UX Design
- The UI/UX must be as intuitive as possible, always aiming to follow patterns and design standards similar to Facebook, Instagram, WhatsApp, Twitter (X), and LinkedIn.
- Prioritize mobile-first design and responsive layouts.
- Keep interfaces clean, minimal, and user-friendly.

## Code Architecture & Best Practices
- Maintain a clean architecture at all times. No spaghetti code.
- Follow SOLID principles and clean code best practices.
- Write small, focused functions and components with a single responsibility.
- Use meaningful and descriptive naming for variables, functions, and components.
- Prefer composition over inheritance.

## Component Reusability
- **IMPORTANT**: Before creating any new component, always check if an existing one can be reused or extended.
- Maximize code reuse across the project.
- Keep components small, modular, and reusable.

## Translations
- We use a custom `useTranslations` hook for all user-facing text.
- Never hardcode strings in the UI. Always use the translation hook.
- When creating new UI text, include the translation key usage.

## Code Consistency
- Always follow the existing code style and patterns already established in the project.
- Match the folder structure, naming conventions, and coding patterns already in use.
- When in doubt, look at how similar features have been implemented before.

## React & TypeScript
- Use functional components with hooks. No class components.
- Always type props, state, and function signatures properly. Avoid `any`.
- Use interfaces for props and complex types.
- Optimize performance: use `React.memo`, `useMemo`, and `useCallback` where appropriate to avoid unnecessary re-renders.
- Keep components pure and avoid side effects outside of `useEffect`.

## Code Readability
- **No comments in the code.** The code must be self-explanatory through clear naming and simple logic.
- If the code needs a comment to be understood, refactor it until it doesn't.

## Error Handling
- Handle errors gracefully and provide meaningful feedback to the user.

## Suggestions
- When suggesting changes or approaches, always explain briefly why it is the recommended approach.