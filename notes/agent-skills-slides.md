---
title: Writing Agent Skills for Cursor and Claude Code
theme: dark
accent_color: "#7c3aed"
title_font: Inter
body_font: Inter
---

# Writing Agent Skills
Giving Your AI a Google Account

---

## What Are Agent Skills?

- An **open standard** for extending AI agents with new capabilities
- Supported by **Cursor**, **Claude Code**, and **Codex** — write once, works everywhere
- A skill is just a **folder**: `SKILL.md` + optional `scripts/`
- Agent discovers skills automatically and decides when they're relevant
- **Progressive disclosure** — metadata loaded first, details on demand

<!-- Skills are not fine-tuning or prompt engineering. They're packaged knowledge + executable tools. -->

---

## Skills vs MCP

::: left
**Skills** = *"how to do it well"*
- Procedures, workflows, best practices
- Runs inside the host environment
- No server, no build step
- Portable across agents
:::

::: right
**MCP** = *"how to connect"*
- Tools, data, structured invocation
- Runs across a process boundary
- Typed schemas, JSON-RPC
- Platform-specific integration
:::

<!-- They're complementary: MCP for capability, Skills for reliability. Anthropic recommends using both. -->

---

## Case Study: Google Workspace Skills

- **9 skills** covering Gmail, Docs, Sheets, Drive, Slides, Calendar, Tasks
- Each skill: `SKILL.md` + Python CLI scripts in `scripts/`
- **Shared library** pattern — one auth client, one retry layer, reused by all
- Agent reads SKILL.md, picks the right script, runs it with args
- Result: say *"what meetings do I have today?"* and get a real answer

---

## The Distribution Problem

- Your skill has **Python dependencies** — user's system Python doesn't have them
- You create a **venv** — but the agent runs `python3` from `$PATH`, not your venv
- Your skill uses **OAuth tokens** — agent must *run* scripts using them, but not *read* them
- Two platforms (**Cursor** and **Claude Code**) with different protection mechanisms

---

## The Bootstrap Pattern

- Installer creates a **dedicated venv** at `~/.cursor/google-workspace-venv/`
- Injects a **self-correcting shim** at the top of every script:

```python
if sys.prefix != venv_dir:
    os.execv(venv_python, [venv_python] + sys.argv)
```

- Script **teleports itself** into the correct Python — transparently
- Agent doesn't know about the venv. User doesn't activate anything. **It just works.**

---

## Credential Protection

::: left
**Cursor**
- Add paths to `~/.cursorignore`
- Agent can't read the file
- Scripts can still use it
:::

::: right
**Claude Code**
- Add `Read(path)` to `~/.claude/settings.json` deny list
- Same effect, different mechanism
- Installer handles both automatically
:::

<!-- Cross-platform: when both installed, protect each platform's creds from the other's agent -->

---

## The Installer as a Reusable Pattern

- **Auto-detect** platforms (Cursor, Claude Code, or both)
- **Create venv** with best available Python
- **Inject bootstrap** into CLI scripts
- **Protect credentials** from agent file access
- Support **`curl | bash`** one-liner install
- All **idempotent** — safe to run twice

---

## What's Next

- **Wrapper script** approach — cleaner alternative to bootstrap injection
- **Windows support** — bootstrap assumes Unix paths
- **Dependency pinning** — reproducible installs with lock files
- **Uninstall command** — clean removal of everything
- **Generic installer template** — extract the reusable pattern for any skill author

**Source:** [github.com/tristanreid/google-workspace-skills](https://github.com/tristanreid/google-workspace-skills)
