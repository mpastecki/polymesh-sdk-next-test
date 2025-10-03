# Next Major Release - Developer Guide

This guide explains how to contribute breaking changes to the next major version of the Polymesh SDK using the ephemeral integration system.

## 📋 Overview

Breaking changes for the next major release are managed through special branches that follow a specific naming convention. These branches are automatically discovered, validated, and integrated to create preview releases.

## 🌿 Branch Naming Convention

### Format
```
bc-<number>-<description>
```

### Rules
- **Must start with `bc-`**
- **Include a number** (determines integration order)
- **Use lowercase letters, numbers, and hyphens only**
- **Be descriptive** about the breaking change

### Examples
```bash
bc-1-remove-deprecated-apis     # Removes old API methods
bc-2-async-interface-changes    # Makes interfaces asynchronous
bc-5-new-error-handling         # Changes error handling approach
bc-10-update-type-definitions   # Updates TypeScript definitions
```

### Numbering Guidelines
- **Start from 1** for the first breaking change
- **Use sequential numbers** for logical ordering
- **Numbers determine integration order**: bc-1 → bc-2 → bc-5 → bc-10
- **Avoid conflicts**: Check for existing branches with the same number
- **Keep under 50** (higher numbers indicate too many breaking changes)

## 🚀 Creating a Breaking Change Branch

### Step 1: Create the Branch
```bash
# Start from the latest develop
git checkout develop
git pull origin develop

# Create your breaking change branch
git checkout -b bc-3-remove-legacy-widget develop
```

### Step 2: Make Your Changes
Implement your breaking changes in the branch:
```bash
# Make your changes
# Edit files, remove deprecated code, etc.

# Stage changes
git add .
```

### Step 3: Commit with Proper Format
Use conventional commits with breaking change indicators:
```bash
git commit -m "feat!: remove legacy Widget class

BREAKING CHANGE: Removed the deprecated Widget.legacy() method

The old Widget.legacy() method has been removed as part of the v3.0
modernization. Applications should migrate to Widget.current() which
provides the same functionality with improved performance.

Migration:
Replace Widget.legacy() with Widget.current()

Affects: All applications using Widget.legacy()"
```

### Step 4: Push the Branch
```bash
git push origin bc-3-remove-legacy-widget
```

## 📝 Commit Message Format

### Basic Structure
```
<type>!: <description>

BREAKING CHANGE: <summary>

[Optional: Additional details, migration guide, code examples, etc.]
```

### Required Elements

#### 1. Commit Type with Breaking Change Indicator
- Use `feat!:` for new features that break compatibility
- Use `fix!:` for fixes that break compatibility
- Use `refactor!:` for refactors that break compatibility
- The `!` after the type indicates a breaking change

#### 2. BREAKING CHANGE Footer
```
BREAKING CHANGE: <clear description of what breaks and why>
```

### Optional: Additional Details

You can include any additional information after the BREAKING CHANGE line:
- Migration instructions with code examples
- What components are affected
- Links to documentation
- Reasoning behind the change

Use plain text or markdown formatting for readability

### Example Commit Messages

#### API Removal
```
feat!: remove deprecated Polymesh.connect() method

BREAKING CHANGE: Removed Polymesh.connect() in favor of Polymesh.create()

The deprecated connect() method has been removed. The create() method
provides the same functionality with better error handling and type safety.

Migration:
Replace Polymesh.connect(config) with Polymesh.create(config)

Affects: Applications using the old connection method
```

#### Interface Changes
```
feat!: make Asset methods async

BREAKING CHANGE: Asset methods now return Promises instead of synchronous values

Methods like asset.getName() now return Promise<string> instead of string.
Update your code to use async/await or .then() to handle the promises.

Example migration:
// Before
const name = asset.getName();

// After
const name = await asset.getName();
```

#### Type Changes
```
refactor!: update Portfolio interface

BREAKING CHANGE: Portfolio.assets property is now readonly

The assets property is now readonly to prevent accidental mutations.
Use Portfolio.addAsset() and Portfolio.removeAsset() methods instead.

This change only affects TypeScript code that directly modifies Portfolio.assets.
```

## 🔄 Integration Process

### Automatic Workflow
1. **Discovery**: System finds all `bc-*` branches
2. **Validation**: Tests sequential integration for conflicts
3. **Integration**: Cherry-picks commits in numerical order
4. **Testing**: Runs test suite on integrated code
5. **Publishing**: Creates preview release (e.g., `v30.0.0-next-major.1`)
6. **Documentation**: Generates release notes with metadata

### Manual Triggers
You can manually trigger the integration workflow:
```bash
# Using npm script
yarn preview:generate

# Or via GitHub Actions UI
# Go to Actions tab → "Generate Next Major Preview" → "Run workflow"
```

### Branch Validation
The system automatically validates:
- ✅ Branch naming convention
- ✅ Number uniqueness
- ✅ Sequential integration compatibility
- ✅ Commit message format
- ✅ Test compatibility

## 📦 Preview Releases

### Version Format
Preview releases use semantic versioning with prerelease identifiers:
```
v30.0.0-next-major.1
v30.0.0-next-major.2
v30.0.0-next-major.3
```

### Installation
Users can install preview versions:
```bash
# Install latest next-major preview
npm install @polymeshassociation/polymesh-sdk@next-major

# Install specific preview version
npm install @polymeshassociation/polymesh-sdk@30.0.0-next-major.1
```

### Testing Your Changes
After integration, test the preview release:
```bash
# Install the preview
npm install @polymeshassociation/polymesh-sdk@next-major

# Your breaking changes are included!
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
```

## ⚠️ Conflict Resolution

### When Conflicts Occur
If your branch conflicts with others during integration:

1. **Automatic Issue Creation**: GitHub issue created with conflict details
2. **Resolution Required**: Follow the provided resolution steps
3. **Manual Rebase**: Update your branch to resolve conflicts

### Resolution Steps
```bash
# 1. Checkout your conflicted branch
git checkout bc-5-your-branch
git fetch origin develop

# 2. Create temporary integration branch
git checkout -b temp-integration develop

# 3. Apply clean branches first (in numerical order)
git cherry-pick $(git rev-list --reverse origin/develop..origin/bc-1-clean-branch)
git cherry-pick $(git rev-list --reverse origin/develop..origin/bc-2-clean-branch)

# 4. Rebase your branch against the integrated state
git checkout bc-5-your-branch
git rebase temp-integration

# 5. Resolve conflicts and continue
git add .
git rebase --continue

# 6. Force push the updated branch
git push --force-with-lease origin bc-5-your-branch

# 7. Clean up
git branch -D temp-integration
```

## 📚 Best Practices

### Branch Management
- **One breaking change per branch** for clear separation
- **Keep branches up to date** with develop to avoid conflicts
- **Use descriptive names** that explain the breaking change
- **Delete branches** after they're integrated into a major release

### Commit Messages
- **Follow conventional commits** for automatic version bumping
- **Include detailed migration steps** for complex changes
- **Add code examples** in commit body when helpful
- **Reference related issues or PRs**

### Testing
- **Test your changes thoroughly** before pushing
- **Consider backward compatibility** impact
- **Add or update tests** for new behavior
- **Check TypeScript definitions** if applicable

### Communication
- **Announce major breaking changes** in team discussions
- **Document migration paths** clearly
- **Consider deprecation periods** for major API changes
- **Update relevant documentation**

## 🚫 Skip Releases

If you need to make commits that shouldn't trigger a release:
```bash
# Add [skip release] to prevent version bumping
git commit -m "chore: update build scripts [skip release]"
git commit -m "docs: fix typo [release skip]"

# Or use non-releasing commit types
git commit -m "chore: update dependencies"
git commit -m "docs: improve README"
git commit -m "test: add unit tests"
```

## 🛠️ Troubleshooting

### Branch Name Validation Failed
```
❌ Invalid branch name: bc-feature-update
✅ Expected format: bc-<number>-<description>
```
**Solution**: Use the correct format: `bc-1-feature-update`

### Number Conflict Warning
```
⚠️ Warning: Found other branches with the same number (5):
  - bc-5-existing-feature
```
**Solution**: Choose a different number: `bc-6-your-feature`

### Integration Conflicts
```
❌ Sequential integration conflict detected
```
**Solution**: Follow the conflict resolution steps provided in the GitHub issue

### Commit Message Format Error
```
❌ Breaking change detected but missing BREAKING CHANGE footer
```
**Solution**: Add proper `BREAKING CHANGE:` footer with metadata

## 📞 Getting Help

- **GitHub Issues**: Automatic conflict reports with resolution steps
- **Team Chat**: Ask questions about breaking change design
- **Documentation**: Refer to `specs/next-release/implementation.md` for technical details
- **Workflow Logs**: Check GitHub Actions for detailed integration logs

## 🔄 Migration to Stable Release

When the next major version is ready:
1. All `bc-*` branches are integrated into `develop`
2. Major version is released from `develop` → `master`
3. Preview releases become the stable release
4. Integrated `bc-*` branches can be deleted
5. Process starts fresh for the next major version

---