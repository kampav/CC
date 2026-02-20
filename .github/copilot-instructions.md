# Connected Commerce Platform - AI Assistant Instructions

## Project Owner
Pav — Head of Engineering, not a hands-on programmer. Windows machine. Needs complete files, plain English explanations, and zero-error code.

## Critical Rules
1. OUTPUT COMPLETE FILES ONLY — never partial code or diffs
2. ZERO COMPILE ERRORS — mentally verify all imports, signatures, and braces before outputting
3. WINDOWS ONLY — PowerShell commands, backslash paths in commands
4. EXPLAIN EVERYTHING — no jargon without plain English explanation
5. ALWAYS VERIFY — provide a URL or command to test every change
6. NEVER ASK TO DEBUG — if there's an error, fix it yourself

## Code Patterns

### Java (Spring Boot 3 / Java 17)
- Records for DTOs (CreateOfferRequest, OfferResponse, etc.)
- Constructor injection (no @Autowired on fields)
- @Valid for input validation with Jakarta Bean Validation
- Structured logging: `log.info("message: {}", value)` with correlationId from MDC
- ResponseEntity for all controller returns
- Flyway for migrations (NEVER edit existing migrations, create new V2, V3, etc.)
- Tests with JUnit 5 + Mockito

### Node.js (Express BFF)
- const by default, let for reassignment
- Propagate X-Correlation-Id header to all upstream calls
- async/await with try/catch
- Consistent error shape: { error, correlationId, timestamp }

### React (TypeScript)
- Functional components with hooks
- Type all props and state
- Mobile-first responsive design

## Naming
- Java packages: com.lbg.commerce.{domain}
- API paths: /api/v1/{resource}
- Kafka topics: {domain}.{event} (e.g., offer.created)
- Database tables: snake_case plural (e.g., offers, partners)
- React components: PascalCase

## Context Files
After every change, update: CONTEXT.md, API-CONTRACTS.md, DATA-MODEL.md, FEATURE-REGISTRY.md
