---
title: "Shipping a Skill: Installers, Bootstraps, and Google OAuth"
description: "Writing a skill is easy. Getting it to work on someone else's machine — with the right Python, the right dependencies, and working credentials — is the real challenge."
weight: 20
series: "Writing Agent Skills"
skin: generative
draft: true
---

In [Part 1](/blog/agent-skills-giving-your-ai-a-google-account/), we saw how to write an Agent Skill — a folder with a `SKILL.md` and some scripts that teaches your AI assistant a new trick. The format is simple. The scripts are standalone. It works great on your machine.

Then someone else tries to install it and gets:

```
ModuleNotFoundError: No module named 'googleapiclient'
```

Welcome to the distribution problem.

---

## The Three Problems

Shipping a skill with Python dependencies creates three problems that interact in annoying ways:

**Problem 1: Dependencies.** Your skill needs `google-api-python-client`, `google-auth`, and a few others. The user's system Python doesn't have them. You can't just say "run `pip install`" because that pollutes their global environment and might conflict with other packages.

**Problem 2: The wrong Python.** Even if you create a virtual environment with all the right packages, the AI agent doesn't know about it. When the agent runs `python3 scripts/list_events.py`, it uses whatever Python is on `$PATH` — which is the system Python, not the venv's Python. Your dependencies aren't there.

**Problem 3: Credentials.** Your skill needs OAuth tokens to talk to Google's APIs. Those tokens are sensitive — you need the AI to *run scripts* that use them, while preventing the AI from *reading* the token file directly. And the two platforms (Cursor and Claude Code) have completely different mechanisms for restricting file access.

The installer I built for the [Google Workspace skills](https://github.com/tristanreid/google-workspace-skills) solves all three. The patterns are reusable — if you're building any skill with Python dependencies, you can steal this approach wholesale. Let me walk through each problem and its solution.

---

## Problem 1: A Dedicated Virtual Environment

The installer creates a dedicated venv specifically for the skills, separate from any project environments:

```bash
# Where the venvs live
~/.cursor/google-workspace-venv/   # For Cursor
~/.claude/google-workspace-venv/   # For Claude Code
```

The `install.sh` handles this with platform auto-detection — it checks whether Cursor, Claude Code, or both are installed, and creates the appropriate venv(s):

```bash
detect_platform() {
    local has_cursor=false
    local has_claude=false

    if [ -d "$HOME/.cursor" ] || command -v cursor &> /dev/null; then
        has_cursor=true
    fi

    if [ -d "$HOME/.claude" ] || command -v claude &> /dev/null; then
        has_claude=true
    fi

    if [ "$has_claude" = true ] && [ "$has_cursor" = true ]; then
        echo "both"
    elif [ "$has_claude" = true ]; then
        echo "claude"
    elif [ "$has_cursor" = true ]; then
        echo "cursor"
    fi
}
```

The venv is created with the best available Python (preferring 3.13 → 3.12 → 3.11 → 3), then dependencies are installed into it. Straightforward.

But creating a venv doesn't solve the real problem — how do you get the agent to *use* it?

---

## Problem 2: The Bootstrap Pattern

This is the cleverest part of the installer, and a pattern I think any skill author with Python dependencies should steal.

The problem: when the agent runs a script, it calls something like `python3 scripts/list_events.py --today`. That `python3` is whatever is on the system `$PATH` — it knows nothing about our venv. The dependencies aren't available, and the script crashes.

The solution: inject a shim at the top of every script that checks "am I running in the right venv?" — and if not, re-executes itself with the venv's Python.

Here's the bootstrap code that gets injected:

```python
# --- Google Workspace Skills Bootstrap ---
import sys as _bootstrap_sys, os as _bootstrap_os
_venv_dir = "/Users/you/.cursor/google-workspace-venv"
if _bootstrap_sys.prefix != _venv_dir and not _bootstrap_os.environ.get("_GWS_BOOTSTRAPPED"):
    _venv_python = _venv_dir + "/bin/python3"
    if _bootstrap_os.path.exists(_venv_python):
        _bootstrap_os.environ["_GWS_BOOTSTRAPPED"] = "1"
        _bootstrap_os.execv(_venv_python, [_venv_python] + _bootstrap_sys.argv)
del _bootstrap_sys, _bootstrap_os, _venv_dir
# --- End Bootstrap ---
```

Let's unpack what this does:

1. **`sys.prefix != _venv_dir`**: Python sets `sys.prefix` to the root of the active environment. If we're running in the system Python, this won't match the venv path.

2. **`os.execv`**: This replaces the current process with a new one. The script re-executes itself, but this time using the venv's Python interpreter (which has all the dependencies).

3. **`_GWS_BOOTSTRAPPED` env var**: Prevents infinite recursion. The first execution sets this flag; the second sees it and skips the bootstrap.

4. **`del` cleanup**: The bootstrap variables are deleted after use so they don't pollute the script's namespace.

The result: any Python on the system can start the script, and it will transparently "teleport" itself into the right environment. The agent doesn't need to know about the venv. The user doesn't need to activate anything. It just works.

### How the Injection Works

The installer doesn't ship scripts with the bootstrap pre-baked — it injects it at install time, because the venv path is different on every machine. The injection logic walks every `.py` file in the skills directory, checks if it's a CLI script (has `argparse` or `if __name__`), and inserts the bootstrap code after the shebang and docstring but before any imports:

```python
# Only inject into CLI scripts
if 'argparse' not in content and 'if __name__' not in content:
    continue

# Insert after shebang and docstring, before first import
```

It's also idempotent — if the bootstrap marker already exists, it skips the file. Running the installer twice doesn't break anything.

---

## Problem 3: Credential Protection

Here's an irony specific to AI coding assistants: you need the agent to *execute* a script that reads credentials, but you don't want the agent to *read* the credential file directly.

Why? Because AI agents have file-reading tools. If the agent can see `~/.cursor/google_credentials.json`, it might read it to "be helpful" — and now your OAuth tokens are sitting in a chat transcript, potentially logged or sent to an API.

The fix: tell each platform "you're not allowed to read this file."

### Cursor: `.cursorignore`

Cursor respects a `.cursorignore` file (like `.gitignore`) that prevents the agent from reading matched paths:

```bash
# ~/.cursorignore
~/.cursor/google_credentials.json
```

The installer adds this automatically:

```bash
setup_cursor_protection() {
    local cursorignore_file="$HOME/.cursorignore"

    if ! grep -qF "$creds_path" "$cursorignore_file" 2>/dev/null; then
        echo "# Google Workspace credentials" >> "$cursorignore_file"
        echo "$creds_path" >> "$cursorignore_file"
    fi
}
```

### Claude Code: `permissions.deny`

Claude Code uses a different mechanism — a `permissions.deny` list in `~/.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(~/.claude/google_credentials.json)"
    ]
  }
}
```

This is trickier to automate because you're editing JSON. The installer uses `jq` if available, with a `sed` fallback for simpler cases and a manual instruction as the last resort:

```bash
if command -v jq &> /dev/null; then
    jq --arg rule "$deny_rule" '
        if .permissions.deny then
            .permissions.deny += [$rule]
        elif .permissions then
            .permissions.deny = [$rule]
        else
            .permissions = {"deny": [$rule]}
        end
    ' "$settings_file" > "$tmp_file"
fi
```

### Cross-Platform Protection

When both platforms are installed, the installer also protects *cross-platform* access — Cursor can't read Claude Code's credentials and vice versa. This matters because the skills check both locations when looking for tokens (so you only need to authorize once).

---

## Working with Google APIs

With the infrastructure in place, let me share some practical lessons from building the Google Workspace integration.

### OAuth for Desktop Apps

Google's OAuth flow for desktop applications uses `InstalledAppFlow` from `google-auth-oauthlib`. The pattern is:

```python
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file(
    "client_secrets.json",
    scopes=SCOPES,
)

credentials = flow.run_local_server(
    port=0,           # Use any available port
    prompt="consent",  # Always show consent screen
)
```

The flow:
1. Opens a browser for the user to grant permission
2. Starts a temporary local HTTP server to catch the OAuth callback
3. Exchanges the authorization code for access and refresh tokens
4. Returns a `Credentials` object

The `port=0` trick is important — it lets the OS pick an available port, avoiding conflicts if something else is using the default port.

### Setting Up Your Own Google Cloud Project

To use these skills, you need your own OAuth credentials (a `client_secrets.json` file). This is a one-time setup:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a project
2. Enable the APIs you need (Gmail, Docs, Sheets, Drive, Slides, Calendar, Tasks)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Choose **Desktop application** as the type
5. Download the JSON file — that's your `client_secrets.json`

Google's full guide is at [Create OAuth client ID credentials](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id).

### Token Refresh

Access tokens expire after about an hour. The `google-auth` library handles refresh automatically — but only if you persist the refreshed token. Otherwise, your users have to re-authorize every hour.

The shared library's credential provider handles this: after any API call that triggers a token refresh, the new token is written back to the credentials file (with 600 permissions).

### Batching API Calls: An Optimization

The naive way to create a Google Doc from markdown is to make one API call per formatting operation — one for each heading, one for each bold span, one for each link. A moderately complex document might need 500+ API calls.

The Google Docs skill uses a four-phase approach that collapses this to 3-5 calls:

1. **Phase 1**: Insert all text as a single batch (1 API call)
2. **Phase 2**: Apply all paragraph styles, then text styles (1-2 API calls)
3. **Phase 3**: Create and populate tables (1 API call per table)
4. **Phase 4**: Post-formatting fixes like link styling

The key insight is that the Docs API supports batch requests — you can send hundreds of formatting operations in a single HTTP request. But you have to get the *ordering* right: paragraph styles (headings) must be applied before text styles (bold, links), because text styles inherit from paragraph styles.

### Retry Logic

Google APIs are generally reliable, but SSL errors, rate limits, and transient failures happen. The shared library's `@retry_on_error` decorator handles this with exponential backoff:

```python
@retry_on_error(max_retries=3)
def list_events(calendar_id="primary", **kwargs):
    service = get_client().calendar_service()
    return service.events().list(calendarId=calendar_id, **kwargs).execute()
```

The retry logic checks for:
- **SSL/TLS errors**: Connection resets, bad records, timeouts — retry with exponential backoff
- **Rate limits (429)**: Honor the `Retry-After` header if present, otherwise back off
- **Server errors (5xx)**: Transient failures — retry a few times before giving up

Everything else (4xx client errors, authentication failures) fails immediately.

---

## The Installer as a Reusable Pattern

The venv + bootstrap + credential protection approach isn't specific to Google Workspace. Any skill with Python dependencies faces the same problems. Here's the playbook distilled into a recipe you can follow:

### The Recipe

**1. Create a dedicated venv.** Don't ask users to install packages globally. Create a venv in a predictable location (`~/.cursor/your-skill-venv/` or `~/.claude/your-skill-venv/`), auto-detect which platforms are present, and install dependencies there.

**2. Inject the bootstrap shim.** At install time, inject a self-correcting preamble into every CLI script that checks `sys.prefix` and `os.execv`s with the venv's Python if needed. This solves the "wrong Python" problem transparently.

**3. Protect sensitive files.** If your skill uses credentials, API keys, or tokens, add them to `.cursorignore` (Cursor) and `permissions.deny` (Claude Code) so the agent can execute scripts that *use* those files without being able to *read* them directly.

**4. Make it idempotent.** Users will run the installer twice. They'll run it with `--force` when something breaks. Check for existing files before overwriting. Skip injection if the bootstrap marker already exists. Don't append duplicate lines to ignore files.

**5. Support both platforms.** The skill directory structure is identical for Cursor (`~/.cursor/skills/`) and Claude Code (`~/.claude/skills/`). Auto-detect and handle both.

**6. Support `curl | bash`.** If your installer can bootstrap itself from a URL, adoption gets much easier:

```bash
curl -fsSL https://raw.githubusercontent.com/you/your-skills/main/install.sh | bash
```

### Where the Pattern Could Be Better

This installer works, but it's a first cut. Here are things I'd improve — and areas where the community could take this further:

**A wrapper script instead of injection.** Right now, the bootstrap code is injected into every `.py` file at install time. This works but it's fragile — the injector has to parse Python well enough to find the right insertion point (after shebangs and docstrings, before imports). An alternative: use a single wrapper script that activates the venv and delegates to the real script. The `SKILL.md` would reference the wrapper, not the script directly. Cleaner, but it changes how scripts are listed in the SKILL.md.

**Windows support.** The bootstrap assumes Unix paths (`/bin/python3`). The venv layout on Windows is different (`Scripts\python.exe`). A production-quality version should handle both, or at minimum detect Windows and warn.

**Dependency pinning.** The installer currently installs packages without version pins (`google-api-python-client`, not `google-api-python-client==2.157.0`). This means two users running the installer a month apart might get different versions. A `requirements.txt` with pinned versions (or a lock file) would make installs reproducible.

**An uninstall command.** There's `--force` for reinstalling, but no `--uninstall` to cleanly remove skills, the venv, and the ignore-file entries. Not hard to add, but easy to forget.

**A generic installer template.** The most useful next step would be extracting the platform detection, venv creation, bootstrap injection, and credential protection into a reusable shell template that any skill author can fork and fill in their own skill list and dependencies. The Google-specific parts are actually a small fraction of the installer — most of the logic is generic.

If you build on this pattern, I'd love to hear about it. The [source code](https://github.com/tristanreid/google-workspace-skills) is MIT-licensed — take what's useful.

---

## The Full Picture

Here's how all the pieces fit together for the Google Workspace skills:

1. **User runs `./install.sh`** → detects platforms, creates venv(s), copies skills, injects bootstrap, protects credentials
2. **User types `/google-workspace-setup`** → agent runs setup script → browser opens for OAuth → tokens saved securely
3. **User asks "what meetings do I have today?"** → agent matches the Calendar skill → runs `list_events.py --today` → bootstrap teleports to venv → script fetches events via Google API → agent presents results conversationally

Every step is designed so the user never has to think about virtual environments, Python paths, or token management. They just ask their question and get an answer.

But the bigger takeaway isn't about Google Workspace. It's that the Agent Skills standard is powerful but unopinionated about distribution — it tells you what a skill *is*, not how to ship one. The venv + bootstrap + credential protection pattern fills that gap. If you're building a skill with Python dependencies, this is a starting point.

The [full source](https://github.com/tristanreid/google-workspace-skills) is on GitHub. The installer logic is in `install.sh` and the patterns are designed to be forked.
