# Connected Commerce - Session Prompt Templates

> **WHAT IS THIS?** Copy-paste these prompts when starting a new AI chat. They give the AI all the context it needs to help you without asking repetitive questions.

---

## Prompt 1: Starting a New Development Step

Copy this ENTIRE block, fill in the blanks, and paste as your FIRST message in a new chat:

```
I'm building the Connected Commerce Platform for Lloyds Banking Group. I am NOT a programmer — I need every instruction explained in plain English with complete files I can copy-paste. I'm on Windows using PowerShell.

GOLDEN RULES:
- Give me COMPLETE files only (never "add this to line 42")
- Windows PowerShell commands only (not bash/Linux)
- Explain every technical term in plain English
- Verify every step with a URL or command I can run
- If I paste an error, give me the COMPLETE corrected file — don't ask me to debug
- After completing work, give me updated context file sections

[PASTE THE ENTIRE CONTEXT.md FILE HERE]

[PASTE THE RELEVANT SECTION FROM API-CONTRACTS.md HERE — only the section for the service you're working on]

[PASTE THE RELEVANT SECTION FROM FEATURE-REGISTRY.md HERE — only the feature being worked on]

CURRENT STEP: Step [X.Y] — [Name]
OBJECTIVE: [One sentence describing what we're building]

Please confirm you understand the current state of the project, then begin.
```

---

## Prompt 2: When You Hit an Error

Copy this, paste the error, and send:

```
I'm getting an error. Here are the details:

SERVICE: [which service, e.g., offer-service]
WHAT I WAS DOING: [e.g., running the service, or testing an API]
COMMAND I RAN: [paste the exact command]
FULL ERROR MESSAGE:
[paste the COMPLETE error — scroll up and copy everything from the first "ERROR" to the end]

Please:
1. Explain what went wrong in plain English (one sentence)
2. Give me the COMPLETE corrected file(s)
3. Tell me how to verify the fix worked

Do NOT ask me to debug. Just fix it.
```

---

## Prompt 3: When You Want to Change a Feature

```
I want to change something in the Connected Commerce Platform.

CHANGE: [describe what you want to change, e.g., "Add a 'discount_percentage' field to offers" or "Change the lifecycle so DRAFT can go directly to LIVE"]

Before making any changes:
1. List ALL files that need to change
2. Explain each change in plain English
3. Ask me to confirm before proceeding

After I confirm:
1. Give me each COMPLETE updated file
2. Give me any new migration files needed
3. Update the context files (CONTEXT.md, API-CONTRACTS.md, DATA-MODEL.md, FEATURE-REGISTRY.md)
4. Tell me how to verify the change works
```

---

## Prompt 4: When Picking Up After a Break

```
I'm continuing work on the Connected Commerce Platform. Here's where I left off:

[PASTE CONTEXT.md]
[PASTE STEP-LOG.md — just the last 2-3 entries]

The last thing I completed was: [Step X.Y — Name]
The next step should be: [Step X.Y — Name]

Please confirm you understand the current state and tell me what we're building next.
```

---

## Prompt 5: When the AI is Confused or Contradicting Itself

```
Let's reset. Here is the COMPLETE current state of the project:

[PASTE THE ENTIRE CONTEXT.md]
[PASTE THE ENTIRE FEATURE-REGISTRY.md]
[PASTE THE ENTIRE API-CONTRACTS.md]

These files are the ONLY source of truth. If anything you've said earlier contradicts these files, these files are correct.

Now, please help me with: [your question]
```

---

## Prompt 6: Mid-Session Context Checkpoint

When the conversation is getting long and you're worried about losing context, paste this:

```
Before we continue, please give me a CHECKPOINT:
1. Summary of everything we've built in this session
2. List of all files created or modified
3. What remains to be done for the current step
4. Any issues discovered
5. Updated CONTEXT.md sections
6. Updated FEATURE-REGISTRY.md sections (if features changed)

I'll save this and use it to continue in a new chat if needed.
```

---

## Prompt 7: Setting Up Observability (Phase 4)

```
I need to set up monitoring for the Connected Commerce Platform so I can:
- See if all services are healthy (green/red dashboard)
- See how fast APIs are responding
- Get alerts if something breaks
- Search through logs to find problems

[PASTE CONTEXT.md]

I'm on Windows. I need Docker-based monitoring that I can start with docker compose.

Please set up:
1. Prometheus (collects metrics from services) — add to docker-compose.yml
2. Grafana (visual dashboard) — add to docker-compose.yml with pre-built dashboard
3. Spring Boot Actuator metrics exported to Prometheus
4. A Grafana dashboard showing: request rate, response time, error rate, JVM memory
5. Health check dashboard showing all service statuses

Give me step-by-step instructions. Every file should be complete and ready to copy-paste.
```

---

## Prompt 8: Request for a Complete New Feature

```
I want to add a completely new feature to the Connected Commerce Platform.

FEATURE: [describe it in plain English]

[PASTE CONTEXT.md]
[PASTE FEATURE-REGISTRY.md]

Please:
1. Design the feature (what tables, APIs, and UI components are needed)
2. Present the design for my approval BEFORE writing any code
3. Break it into steps small enough for one AI session each
4. For each step, list the files that will be created/modified

After I approve the design, we'll build it step by step.
```
