# Agent Skills — Post-Publish Tasks

After the blog posts are published and the public repo (`google-workspace-skills`) is pushed to GitHub:

## Create Issues on Public Repo

Replicate these installer improvement issues from the internal repo to `github.com/tristanreid/google-workspace-skills`:

1. **Replace bootstrap injection with wrapper script approach** (internal: #22)
   - Use a single wrapper script instead of injecting bootstrap into every .py file
   - Cleaner, less fragile, but changes SKILL.md script references

2. **Add Windows support to bootstrap and installer** (internal: #23)
   - Bootstrap assumes Unix paths (`/bin/python3`), Windows uses `Scripts\python.exe`
   - At minimum detect Windows and warn; ideally support both

3. **Pin dependency versions for reproducible installs** (internal: #24)
   - Currently installs without version pins
   - Add a `requirements-lock.txt` with pinned versions

4. **Add --uninstall flag to installer** (internal: #25)
   - Clean removal of skills, venv, ignore-file entries, and optionally credentials
   - Should be idempotent

5. **Extract a generic skill installer template** (internal: #26)
   - Pull the reusable parts of install.sh into a template other skill authors can fork
   - Separate generic (platform detection, venv, bootstrap, credential protection) from project-specific (skill list, deps, paths)

## Push the Public Repo

```bash
cd repos/google-workspace-skills
git remote add origin git@github.com:tristanreid/google-workspace-skills.git
git push -u origin main
```

## Verify Blog Post Links

After pushing, verify that all links in both blog posts resolve:
- `https://github.com/tristanreid/google-workspace-skills`
- `https://github.com/tristanreid/google-workspace-skills/blob/main/install.sh`
