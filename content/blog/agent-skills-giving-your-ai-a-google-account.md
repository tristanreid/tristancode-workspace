---
title: "Giving Your AI a Google Account: Writing Agent Skills for Cursor and Claude Code"
description: "Agent Skills are an open standard for extending AI coding assistants with new capabilities. Here's how to write one, using a Google Workspace integration as a real example."
weight: 10
series: "Writing Agent Skills"
series_weight: 100
skin: generative
draft: true
---

What if you could say "what meetings do I have today?" to your AI coding assistant — and it actually checked your Google Calendar and told you?

Not by switching to a browser. Not by copy-pasting from another window. Just a natural-language question answered with live data from your own account.

That's what I built. It started as a weekend experiment — "can I get Cursor to read my email?" — and grew into a full [Google Workspace integration](https://github.com/tristanreid/google-workspace-skills) that handles Gmail, Google Docs, Sheets, Drive, Slides, Calendar, and Tasks. All through natural conversation.

The mechanism that makes it work is called an **Agent Skill** — an open standard for teaching AI agents new tricks. And the best part is how simple the format is.

---

## Why Skills? (And What About MCP?)

If you've been following the AI tooling space, you might be thinking: "doesn't MCP already solve this?" Google has an official [Workspace extension for Gemini CLI](https://github.com/gemini-cli-extensions/workspace) that provides similar Google Workspace access via an MCP server. It's well-built, covers Docs, Drive, Gmail, Calendar, Sheets, Slides, and Chat, and installs with a single command.

But it's a different kind of thing. A useful way to think about it:

- **Skills = "how to do it well"** — procedures, best practices, repeatable workflows
- **MCP = "how to connect"** — tools, data access, structured invocation across process boundaries

The architectural distinction matters. An MCP server is a separate process that communicates with the agent over stdio or HTTP using typed JSON-RPC schemas. The agent sends a tool call; the server executes it and returns a result. It's powerful and structured, but it means a running server, a build step (typically TypeScript/Node.js), and platform-specific integration. The Gemini extension, for example, works only with Gemini CLI.

A skill lives *inside* the agent's host environment. It's a folder of markdown and scripts on the filesystem. The agent reads the instructions, understands what scripts are available, and executes them directly in the same runtime — no separate process, no protocol boundary. This makes skills natural for coding agents (Cursor, Claude Code, Codex) where the agent already has filesystem and shell access.

Skills also had **progressive disclosure** from day one: the agent loads lightweight metadata first (the `description` in frontmatter), then reads the full `SKILL.md` only when the skill is relevant, and loads additional reference files only when needed. MCP historically loaded all tool schemas upfront, consuming context window budget. The ecosystem has since corrected this with [Tool Search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool) (deferred tool discovery), but the point is that skills were designed for context efficiency from the start.

The good news: **they're complementary, not competing.** Anthropic's own guidance recommends using both — MCP for capability (auth, API connectivity, structured schemas) and skills for reliability (workflows, best practices, "how to use those tools well"). There's even an [active proposal](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions) to make skills a first-class MCP primitive, which would let MCP servers distribute skills-like content in a portable way. The boundary between them is blurring.

For Google Workspace integration — where the operations are straightforward request/response calls against well-documented REST APIs — skills are a natural fit. The scripts are just Python CLI tools: easy to read, debug, and modify. And because skills work across Cursor, Claude Code, and Codex through an [open standard](https://agentskills.io), you write once and it works everywhere.

That's really the point of this project: it's a teaching vehicle. The Google Workspace skills are useful on their own, but the patterns they demonstrate — how to write a SKILL.md, how to structure a multi-skill project, how to handle shared infrastructure, and especially how to distribute a skill with dependencies — are applicable to any skill you might build.

---

## What Is an Agent Skill?

A skill is a folder. That's it — at its core, it's a folder containing a markdown file called `SKILL.md` that teaches an AI agent how to do something new.

Skills are supported by [Cursor](https://cursor.com/docs/context/skills), [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview), and [Codex](https://openai.com/index/introducing-codex/), with more on the way. The format is defined by an [open standard](https://agentskills.io) that Anthropic released and the community is building on.

Here's how it works: you drop a skill folder into `~/.cursor/skills/` (for Cursor) or `~/.claude/skills/` (for Claude Code). When the agent starts, it discovers the skill automatically. It reads the `SKILL.md`, understands what the skill does and when to use it, and — when the moment is right — reaches for it.

You can also invoke a skill manually by typing `/skill-name` in chat.

---

## Anatomy of a Skill

The simplest possible skill is just a folder with a `SKILL.md`:

```
~/.cursor/skills/
└── my-skill/
    └── SKILL.md
```

The `SKILL.md` has YAML frontmatter (name and description) and markdown instructions:

```markdown
---
name: my-skill
description: What this skill does and when to use it.
---

# My Skill

Instructions for the agent go here.

## When to Use

- Use this skill when the user asks about...
- This skill is helpful for...
```

That's a complete skill. The `description` field is critical — it's what the agent uses to decide whether this skill is relevant to the current conversation. Think of it as the skill's elevator pitch.

For skills that do more than provide instructions — skills that actually *do things* — you add a `scripts/` directory with executable code the agent can run:

```
~/.cursor/skills/
└── google-calendar/
    ├── SKILL.md
    └── scripts/
        ├── list_events.py
        ├── create_event.py
        ├── search_events.py
        └── get_free_busy.py
```

The scripts can be written in any language. The `SKILL.md` tells the agent what each script does and how to call it. The agent reads the instructions, decides which script to run, and executes it.

---

## A Real Example: Google Workspace Skills

My [google-workspace-skills](https://github.com/tristanreid/google-workspace-skills) project is a collection of 9 skills that give Cursor and Claude Code full access to Google Workspace:

```
skills/
├── google-calendar/          # Events, availability, scheduling
├── google-docs/              # Create and edit documents
├── google-drive/             # Files, folders, search
├── google-gmail/             # Search, read, send email
├── google-sheets/            # Read and write spreadsheets
├── google-slides/            # Create presentations from markdown
├── google-tasks/             # Task lists, subtasks, due dates
├── google-workspace-setup/   # One-time OAuth credential setup
└── google-workspace-shared/  # Shared auth, errors, retry logic
```

Each one follows the same pattern: a `SKILL.md` that teaches the agent what the skill can do, and `scripts/` with Python CLI tools the agent calls.

### What a Good SKILL.md Looks Like

The best way to understand the format is to look at a real one. Here's the Calendar skill's `SKILL.md` (trimmed for readability):

```yaml
---
name: google-calendar
description: Read and manage Google Calendar events
---
```

```markdown
# Google Calendar Skill

## When to Use

Use this skill when you need to:
- List upcoming calendar events
- Find meetings with specific people
- Check availability (free/busy)
- Create new calendar events

## Prerequisites

Run `google-workspace-setup` first to configure credentials.

## Capabilities

### Listing Events

    What meetings do I have today?
    Show my calendar for this week
    List events from January 15 to January 20

### Creating Events

    Schedule a meeting with bob@example.com tomorrow at 3pm for 30 minutes
    Create an event "Team Standup" on Monday at 9am

## Scripts

- `scripts/list_events.py` - List events for a date range
- `scripts/create_event.py` - Create new events
- `scripts/search_events.py` - Search events by attendee or keyword
- `scripts/get_free_busy.py` - Query availability
```

Notice what this does:

1. **"When to Use"** tells the agent the situations where this skill is relevant. This is the most important section. When you say "am I free tomorrow at 2pm?", the agent scans its available skills and matches this description.

2. **Natural language examples** under each capability show the agent what kinds of requests map to what operations. These aren't rigid commands — they're examples the agent uses to generalize.

3. **Scripts** lists the actual tools, with a brief description of each. The agent reads this, picks the right script, and runs it with appropriate arguments.

The result: you say "what meetings do I have today?" and the agent understands it should call `list_events.py --today`, parses the output, and presents it conversationally.

### The Shared Library Pattern

Nine skills accessing seven different Google APIs creates a lot of shared concerns: authentication, token refresh, error handling, retries. Rather than duplicating this in every skill, there's a dedicated `google-workspace-shared` skill that houses the common infrastructure:

```
google-workspace-shared/
├── SKILL.md
└── scripts/
    ├── google_client.py         # Unified client for all Google APIs
    ├── credential_providers.py  # Load tokens from file, env, or memory
    ├── errors.py                # Custom exceptions (CredentialError, RateLimitError, etc.)
    ├── retry.py                 # Exponential backoff with Retry-After support
    ├── permissions.py           # Drive sharing and ownership
    └── url_utils.py             # Extract IDs from Google URLs
```

Each skill script imports from this shared library:

```python
from google_client import GoogleWorkspaceClient, get_client
```

The `get_client()` function returns a singleton client that handles credential loading, token refresh, and service caching. Every skill gets the same robust authentication without any of them needing to know how it works.

This is a pattern worth stealing. If you're building a suite of related skills, extract the shared plumbing into its own skill directory. The `SKILL.md` for the shared library explicitly says "this skill should not be invoked directly" — it exists purely as infrastructure for the other skills.

---

## Writing Your Own Skill

Let me walk through what it takes to write a skill from scratch.

### Step 1: Start with the SKILL.md

Before writing any code, write the `SKILL.md`. It's the interface contract between your skill and the agent. The three essential sections are:

- **Description** (in the frontmatter): One sentence that tells the agent what this skill does. Be specific — "Read and manage Google Calendar events" is better than "Google Calendar integration."
- **When to Use**: A bullet list of situations where the agent should reach for this skill. Think about what the user would *say*, not what the code *does*.
- **Scripts**: A list of the executable tools with brief descriptions.

### Step 2: Write Standalone Scripts

Each script should be a standalone CLI tool. The agent will call it like `python scripts/my_script.py --arg value`, so use `argparse` and print structured output:

```python
#!/usr/bin/env python3
"""List upcoming calendar events."""

import argparse
import json

def main():
    parser = argparse.ArgumentParser(description="List calendar events")
    parser.add_argument("--today", action="store_true", help="Show today's events")
    parser.add_argument("--days", type=int, default=7, help="Days to look ahead")
    args = parser.parse_args()

    events = fetch_events(args)  # Your API call here

    for event in events:
        print(f"{event['start']}  {event['summary']}")

if __name__ == "__main__":
    main()
```

A few guidelines:
- **Clear output**: The agent reads `stdout` to understand results. Make the output human-readable.
- **Helpful errors**: If something goes wrong, print a clear error message to `stderr`. The agent will read that too and try to help.
- **Self-contained**: Each script should work if called directly from the command line. This makes debugging trivial.

### Step 3: Keep the SKILL.md Focused

The agent reads the `SKILL.md` every time it considers using your skill. That's context window budget being spent. Keep the main file concise — put detailed reference material in a `references/` directory that the agent loads only when needed:

```
my-skill/
├── SKILL.md                    # Core instructions (keep this lean)
├── scripts/
│   └── do_thing.py
└── references/
    └── api-reference.md        # Detailed docs loaded on demand
```

### Step 4: Test Interactively

The fastest way to test is to drop your skill folder into `~/.cursor/skills/` (or `~/.claude/skills/`) and try it:

1. Type `/your-skill-name` in chat to invoke it explicitly
2. Or just ask a question that matches your "When to Use" section and see if the agent picks it up

If the agent doesn't find your skill, check:
- Does the folder name match the `name` in the frontmatter?
- Is the `description` specific enough?
- Is the `SKILL.md` in the right location?

---

## What's Next

Writing a skill is easy. The hard part — the part nobody warns you about — is shipping one to other people's machines.

Your skill has Python dependencies? The user's system Python probably doesn't have them. Your scripts need to run in a virtual environment? The agent invokes Python from `$PATH`, not your venv. Your skill uses OAuth credentials? You need the AI to *run* scripts that use those credentials while preventing the AI from *reading* the credential file directly.

In [Part 2](/blog/agent-skills-shipping-installers-bootstraps-oauth/), I'll walk through the installer I built for the Google Workspace skills — including a clever bootstrap pattern that ensures scripts always run with the right Python, a credential protection scheme that works across both Cursor and Claude Code, and practical lessons from working with Google's OAuth APIs.

The [source code](https://github.com/tristanreid/google-workspace-skills) is on GitHub if you want to explore it yourself.
