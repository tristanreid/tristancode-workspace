#!/usr/bin/env python3
"""Check that all internal links in blog posts resolve to real content.

Validates:
  - Blog post links:  ](/blog/some-slug/)  → content/blog/some-slug.md exists
  - Image links:      ](/images/dir/file)  → static/images/dir/file exists
  - Data links:       ](/data/dir/file)    → static/data/dir/file exists

Ignores:
  - External links (http/https/mailto)
  - Anchor-only links (#section)
  - Hugo shortcodes and template refs

Exit code 0 if all links resolve, 1 if any are broken.
Designed to run as a pre-commit hook or standalone.
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = REPO_ROOT / "content"
STATIC_DIR = REPO_ROOT / "static"

# Matches markdown links: [text](target) and [text](target#anchor)
LINK_RE = re.compile(r"\[(?:[^\]]*)\]\(([^)]+)\)")


def resolve_blog_link(path: str) -> bool:
    """Check if /blog/slug/ resolves to content/blog/slug.md."""
    # Strip anchor, then trailing slash
    clean = path.split("#")[0].rstrip("/")
    if clean == "/blog" or clean == "":
        # Link to /blog/ itself — check for _index.md
        return (CONTENT_DIR / "blog" / "_index.md").exists()
    # /blog/some-slug -> some-slug
    slug = clean.removeprefix("/blog/")
    candidate = CONTENT_DIR / "blog" / f"{slug}.md"
    return candidate.exists()


def resolve_static_link(path: str) -> bool:
    """Check if /images/... or /data/... resolves to a static file."""
    # Strip anchor
    clean = path.split("#")[0]
    candidate = STATIC_DIR / clean.lstrip("/")
    return candidate.exists()


def extract_links(filepath: Path) -> list[tuple[int, str]]:
    """Return (line_number, link_target) for all markdown links in a file."""
    results = []
    text = filepath.read_text(encoding="utf-8")
    for i, line in enumerate(text.splitlines(), start=1):
        # Skip lines inside fenced code blocks
        for match in LINK_RE.finditer(line):
            target = match.group(1).strip()
            results.append((i, target))
    return results


def is_internal(target: str) -> bool:
    """True if this looks like an internal site link (not external, not anchor-only)."""
    if target.startswith(("http://", "https://", "mailto:", "tel:")):
        return False
    if target.startswith("#"):
        return False
    if target.startswith("{{"):  # Hugo shortcode
        return False
    return True


def check_link(target: str) -> bool:
    """Return True if the internal link resolves."""
    # Strip anchor for path resolution
    path = target.split("#")[0]

    if path.startswith("/blog/") or path.startswith("/blog"):
        return resolve_blog_link(path)
    if path.startswith("/images/") or path.startswith("/data/"):
        return resolve_static_link(path)
    if path.startswith("/series/"):
        # Series pages depend on Hugo taxonomy config — flag as suspicious
        return False
    if path.startswith("/"):
        # Other absolute paths — check static/ or content/ as appropriate
        # For now, just check if the file exists in static
        static_candidate = STATIC_DIR / path.lstrip("/")
        if static_candidate.exists():
            return True
        # Could also be a content section — check for _index.md
        content_candidate = CONTENT_DIR / path.lstrip("/")
        if content_candidate.exists() or (content_candidate / "_index.md").exists():
            return True
        # Check with .md extension
        content_md = CONTENT_DIR / (path.lstrip("/") + ".md")
        if content_md.exists():
            return True
        return False

    # Relative links — resolve from the file's content directory
    # These are less common in Hugo but handle them gracefully
    return True  # Don't flag relative links as broken (they're context-dependent)


def check_file(filepath: Path) -> list[tuple[int, str]]:
    """Return list of (line_number, broken_target) for a single file."""
    broken = []
    in_code_block = False

    text = filepath.read_text(encoding="utf-8")
    for i, line in enumerate(text.splitlines(), start=1):
        # Track fenced code blocks
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        for match in LINK_RE.finditer(line):
            target = match.group(1).strip()
            if is_internal(target) and not check_link(target):
                broken.append((i, target))

    return broken


def main() -> int:
    blog_dir = CONTENT_DIR / "blog"
    if not blog_dir.exists():
        print("ERROR: content/blog/ not found", file=sys.stderr)
        return 1

    md_files = sorted(blog_dir.glob("*.md"))
    total_links = 0
    total_broken = 0
    broken_files: list[tuple[Path, list[tuple[int, str]]]] = []

    for filepath in md_files:
        broken = check_file(filepath)
        # Count total internal links for summary
        in_code_block = False
        text = filepath.read_text(encoding="utf-8")
        for line in text.splitlines():
            stripped = line.lstrip()
            if stripped.startswith("```"):
                in_code_block = not in_code_block
                continue
            if in_code_block:
                continue
            for match in LINK_RE.finditer(line):
                target = match.group(1).strip()
                if is_internal(target):
                    total_links += 1

        if broken:
            broken_files.append((filepath, broken))
            total_broken += len(broken)

    if broken_files:
        print(f"BROKEN LINKS FOUND ({total_broken} broken / {total_links} checked)\n")
        for filepath, broken in broken_files:
            relpath = filepath.relative_to(REPO_ROOT)
            for lineno, target in broken:
                print(f"  {relpath}:{lineno}  →  {target}")
        print()
        return 1
    else:
        print(f"All internal links OK ({total_links} checked across {len(md_files)} files)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
