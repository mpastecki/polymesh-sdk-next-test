# General Repository Requirements

## 1. Purpose

This document outlines the fundamental requirements applicable to **all company repositories** hosted on our version control platform (e.g., GitHub). Adhering to these standards ensures consistency, maintainability, security, and a high-quality development process across all projects.

Specific repositories may have additional or more detailed requirements outlined in their respective documentation, but these general requirements form the baseline.

## 2. Core Requirements

All repositories **must** adhere to the following:

### 2.1. Linear History on Release Branches

**Definition:** Release branches are critical branches from which software releases are made or that represent a stable state of development. Common examples include:

- `master` / `main`
- `develop`
- `beta`, `next`, `release-candidate`
- Long-term support branches (e.g., `v1.x`, `release/2.0`)

**Requirement:** These branches **must** maintain a linear Git history. This means that the commit history should appear as a single, straight line without merge commits from feature branches cluttering it.

**Achieved By:**
- Using "Rebase and Merge" or "Squash and Merge" strategies for Pull Requests (PRs) targeting these branches.
- Developers rebasing their feature branches onto the target branch before PRs are considered ready for merge.
- Maintainers performing fast-forward merges locally when integrating approved PRs.

**Why Linear History?**
- **Clarity:** `git log` becomes much easier to read and understand. The history tells a clear story of features and fixes being added sequentially.
- **Simplified Debugging:** Tools like `git bisect` are more effective and straightforward to use on a linear history.
- **Easier Reverts:** Reverting a single commit or a sequence of commits is simpler without interwoven merge commits.
- **Cleaner Cherry-Picking:** Moving specific commits between branches is less prone to conflicts.
- **Audibility and change control management:** ensures an accurate history of the versions and, coinciding with code signing + two-person approvals for changes, the code content of projects that have been built by our CI/CD systems, deployed within our infrastructure, and the resulting artifacts delivered to our end users (such as via Docker Hub container images or NPM packages)

### 2.2. Verified Commit Signatures using ed25519-sk SSH Keys

**Definition:** Every commit pushed to a release branch (and ideally all branches) must be cryptographically signed using an `ed25519-sk` SSH key (which implies a FIDO2/U2F hardware security key). The signature must be verifiable against a known SSH key registered with the committer's account on our version control platform.

**Requirement:**
a. All commits **must** be signed using an `ed25519-sk` SSH signing key. This requires a FIDO2/U2F hardware security key that supports this key type.
b. The `ed25519-sk` SSH key used for signing **must** be registered and verified within our version control platform.
c. Repository settings should be configured to reject pushes containing unsigned commits or commits signed by unverified or non-`ed25519-sk` keys to protected release branches.

**Why Verified ed25519-sk Signatures?**
- **Hardware-Backed Security:** `ed25519-sk` keys are typically tied to hardware security keys (like YubiKey), meaning the private key never leaves the hardware device. This provides a very high level of assurance against private key compromise.
- **Authenticity:** Confirms that the commit was made by the claimed author and that they physically possessed the hardware key at the time of signing.
- **Integrity:** Ensures that the code has not been tampered with since it was signed by the author.
- **Non-repudiation:** Provides strong, hardware-backed evidence of who contributed specific code changes, enhancing accountability.
- **Enhanced Security:** Helps prevent unauthorized code injection and maintains a highly trusted codebase.

*(Note: Refer to the "Setting up ed25519-sk SSH Commit Signing" guide for instructions on generating and configuring your environment with a compatible hardware security key.)*

## 3. Impact on GitHub UI Merging

The combination of requiring a **linear history** and verified **ed25519-sk** SSH key signatures has significant implications for how Pull Requests (PRs) are merged, particularly when considering the standard UI "Merge" button on platforms like GitHub.

### The Default "Merge pull request" Button:
- The default action of the green "Merge pull request" button on GitHub (and similar buttons on other platforms) is to create a **merge commit**.
- A merge commit, by its nature, has two parents and introduces a non-linear point in the history of the target branch.
- **This directly violates our "Linear History" requirement.**
- Even if this merge commit *could* be signed (which depends on platform capabilities for signing merge commits initiated via UI with specific hardware keys), the introduction of a merge commit itself is disallowed on release branches.

### "Rebase and merge" / "Squash and merge" via UI:
- Platforms like GitHub offer "Rebase and merge" and "Squash and merge" options. These options *do* result in a linear history on the target branch.
- **However, reliance on UI merging for these is generally not feasible with ed25519-sk keys:**
  - The action of signing a commit with an `ed25519-sk` key requires a physical interaction with the hardware key (e.g., a touch). This interaction is typically handled by the local Git client and SSH agent.
  - Web UIs cannot directly trigger this local hardware key interaction to sign the newly created commit(s) during a rebase/squash operation performed server-side by the platform.
  - Therefore, even if the UI *could* perform the rebase/squash, the resulting commit(s) would either be unsigned or signed by a platform-held key, not the maintainer's `ed25519-sk` key, violating our signature requirement.

Therefore, for merging into our key release branches, we standardize on a **local CLI-based workflow for maintainers**. This is the only reliable way to ensure a linear history where all commits are properly signed with the maintainer's `ed25519-sk` hardware key.

## 4. Recommended Local Merge Workflow (for Maintainers)

Once a Pull Request has been reviewed, approved, and all CI checks are green, the designated maintainer should merge it locally using the following steps. This ensures a fast-forward merge, preserving linear history and ensuring commits are signed with their `ed25519-sk` key.

### Prerequisites:
- The maintainer has an `ed25519-sk` SSH key configured for commit signing in their local Git environment.
- The feature branch associated with the PR **must** be rebased on top of the latest target branch by the PR author. If not, a fast-forward merge will not be possible.

### 1. Configure Git for SSH Signing (if not already global):
Ensure your Git is configured to sign commits with your SSH key.

```bash
git config --global gpg.format ssh # Tell Git to use SSH for GPG-style signing
git config --global user.signingkey "path/to/your/ed25519-sk.pub" # Or key fingerprint/ID
# Optionally, to always sign:
# git config --global commit.gpgsign true
```

*(The exact path or key ID might vary based on your SSH agent setup.)*

### 2. Checkout the Target Branch:
Ensure you are on the branch you intend to merge into (e.g., `develop`, `master`).

```bash
git checkout develop
```

### 3. Pull Latest Changes for Target Branch:
Make sure your local target branch is up-to-date with the remote.

```bash
git pull origin develop
# Or, for absolute certainty and to avoid accidental local merge commits:
# git fetch origin
# git reset --hard origin/develop
```

### 4. Fetch Changes from the PR's Source Branch:
(Assuming the PR is from `feature/some-cool-feature` on the `origin` remote)

```bash
git fetch origin feature/some-cool-feature
```

### 5. Perform a Fast-Forward Merge:
Merge the feature branch into your local target branch using the `--ff-only` (fast-forward only) flag. Git will prompt for hardware key interaction if `commit.gpgsign` is true or if you use `git merge -S --ff-only ...` for explicit signing of the merge commit (though with `--ff-only` there's no new merge commit, the existing commits are just brought forward). The critical part is that all commits being brought forward from the feature branch must already be signed correctly by their authors.

```bash
git merge --ff-only origin/feature/some-cool-feature
```

If this command fails, it means the feature branch is not a direct descendant of the current HEAD of your target branch (i.e., it hasn't been properly rebased). The PR author needs to rebase their branch.

All commits being merged **must** have valid signatures from `ed25519-sk` keys from known authors. Your local Git (if configured for verification) and the remote platform (on push, based on branch protection rules) will enforce this.

### 6. Push the Updated Target Branch:
Push the newly merged changes (which are now a linear extension of the previous history) to the remote repository.

```bash
git push origin develop
```

### 7. (Optional but Recommended) Push Tags:
If the merge corresponds to a release, and the branch doesn't have this done automatically, tag it appropriately (signed tags are recommended) and push the tag. You will be prompted for hardware key interaction for a signed tag.

```bash
# git tag -s v1.2.3 -m "Release version 1.2.3" # -s for signed tag with your default key
# git push origin v1.2.3
```

### 8. Clean Up:
The remote feature branch can now be deleted (usually done via the GitHub after merging the PR, or by the maintainer via CLI).

## 5. Developer Responsibility: Rebasing and Signing Feature Branches

To enable the fast-forward merge workflow, developers working on feature branches **must**:

### 1. Configure ed25519-sk Commit Signing:
Ensure their local Git environment is configured to sign commits with their `ed25519-sk` SSH key.

```bash
git config --global gpg.format ssh
git config --global user.signingkey "path/to/their/ed25519-sk.pub"
git config --global commit.gpgsign true # Recommended to always sign
```

### 2. Sign All Commits:
Each commit made on the feature branch must be signed. This will prompt for hardware key interaction.

### 3. Keep Branches Rebased:
Regularly rebase their feature branches onto the target branch:

```bash
# On your feature branch (e.g., feature/some-cool-feature)
git fetch origin
git rebase origin/develop # Assuming 'develop' is your target branch
# Resolve any conflicts if they occur (new commits created during rebase will also need signing)
git push --force-with-lease origin feature/some-cool-feature
```

This ensures their changes are applied cleanly on top of the latest state of the target branch, with all commits properly signed, making a fast-forward merge possible.