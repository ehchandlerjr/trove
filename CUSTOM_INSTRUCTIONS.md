# Giftwise Project Custom Instructions

## Project Context
Giftwise is a wishlist app following "concentric circles" development - each phase is a complete, shippable product. Built with Next.js 15, Supabase, TypeScript (branded IDs), Tailwind CSS v4. Design philosophy: Thomistic beauty (integritas, consonantia, claritas).

**Always read `/CLAUDE.md` first** - it contains current state, what's built, and next steps.

## Development Principles
1. **Extend, never refactor** - Architecture supports Circle 5 from day one
2. **Grandma to Engineer** - Every feature passes both usability tests  
3. **Thomistic beauty** - Warm chromatic colors, spring physics, theme-specific spacing densities, Georgia/Inter/Nunito fonts
4. **Gold-standard engineering** - Branded IDs, Result types, comprehensive RLS

## Code Patterns
- Server components by default, 'use client' only when needed
- Type assertions for Supabase SSR: `insert(data as never)`, then cast results
- Design tokens in CSS variables, not hardcoded values
- Framer Motion for animations with spring physics (stiffness: 300, damping: 30)

## File Locations
- `/CLAUDE.md` - Project state and roadmap
- `/docs/PRODUCT_SPEC.md` - Complete feature specification  
- `/docs/ROADMAP.md` - Development sequence
- `/src/lib/core/types.ts` - Type definitions with branded IDs
- `/src/lib/db/database.types.ts` - Supabase types (manual, matches schema)
- `/extension/` - Chrome extension (Circle 2)

## Before Starting Work
1. Check `/CLAUDE.md` for current state
2. Run `npm run build` to verify starting point
3. Ask clarifying questions if task is ambiguous

## During Development
- Commit logical chunks of work
- Update `/CLAUDE.md` when completing features
- Run `npm run build` after significant changes to catch type errors early

## CRITICAL: Conversation Limit Protocol

**When you sense you're approaching the conversation limit** (long session, many tool calls, complex multi-file work):

1. **Bundle immediately:**
   ```bash
   cd /home/claude/giftlist && zip -r /home/claude/giftlist-backup.zip . -x "node_modules/*" -x ".next/*" -x ".git/*"
   ```

2. **Present the file** using `present_files`

3. **Write a handoff prompt** the user can copy-paste to continue:
   ```
   ## Handoff Prompt for Next Conversation
   
   **What was completed:**
   - [List completed items]
   
   **What's in progress:**
   - [Current task with specific file/line if applicable]
   
   **To continue:**
   1. Upload the attached zip
   2. [Specific next steps]
   
   **Build status:** [passing/failing with specific error if any]
   
   **Copy this prompt to start the next conversation:**
   ---
   [Ready-to-paste prompt with context]
   ---
   ```

4. **Do this proactively** - don't wait until you hit the limit mid-task

## Response Style
- Be direct, minimize preamble
- Show code changes, don't just describe them
- When auditing, be "exceptionally difficult but fair"
- Use the Thomistic design vocabulary (integritas, consonantia, claritas) when discussing UI

## Common Tasks

**Adding a new feature:**
1. Update types in `/src/lib/core/types.ts`
2. Update database types in `/src/lib/db/database.types.ts` if needed
3. Create/update API route
4. Create/update UI components
5. Update `/CLAUDE.md`

**Fixing type errors:**
- Supabase SSR has aggressive type inference
- Use `as never` for insert/update, then cast results: `const typed = result as { field: type }`

**Running audits:**
- UX walkthrough (grandma + engineer perspectives)
- Edge cases (empty/loading/error states, mobile)
- Accessibility (keyboard, screen reader, contrast)
- Security (RLS policies)
