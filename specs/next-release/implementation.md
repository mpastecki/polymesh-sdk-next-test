# Ephemeral Next Major Release Integration - Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Prerequisites](#prerequisites)
4. [Workflow Files](#workflow-files)
5. [Configuration](#configuration)
6. [Supporting Scripts](#supporting-scripts)
7. [Integration with Existing Infrastructure](#integration-with-existing-infrastructure)
8. [Testing Strategy](#testing-strategy)
9. [Rollout Plan](#rollout-plan)
10. [Troubleshooting](#troubleshooting)

## Overview

This guide provides a complete implementation of the Ephemeral Next Major Release Integration process for the Polymesh SDK repository. The system manages breaking changes through numbered feature branches (`bc-<number>-<description>`) that are automatically discovered, ordered, and integrated for preview releases.

### Key Features
- **Automated breaking change discovery** using branch naming conventions
- **Sequential integration validation** to detect conflicts early
- **Zero-tolerance conflict prevention** - no partial releases
- **Ephemeral integration branches** - ensures deterministic results
- **Semantic-release integration** for consistent versioning and publishing
- **Comprehensive conflict reporting** via GitHub issues
- **Integration with existing ed25519-sk commit signing requirements**

### Architecture Principles
- Maintains strictly linear Git history (no merge commits)
- Supports ed25519-sk commit signing requirements where possible
- Prevents history rewriting on shared branches
- All integrations performed by GitHub Actions automation
- Uses ephemeral branches for deterministic, conflict-free integration
- Leverages existing semantic-release infrastructure

## Architecture Decisions

### Why Ephemeral Integration Branches Are Essential

This system uses **ephemeral integration branches** that are created fresh from the `develop` branch for each integration attempt, rather than updating a persistent `next` branch directly. This approach was chosen after careful analysis of alternatives.

#### The Problem with Persistent Branches

If we used a persistent `next` branch for integration:

**State Accumulation Problem**: The `next` branch would accumulate commits from previous integration attempts:
- First run: `next` = `develop` + bc-1 + bc-2
- Second run with new bc-3: `next` = (develop + bc-1 + bc-2) + bc-3
- But what if bc-1 was deleted? Or bc-2 was updated?

**Unpredictable Integration Order**: With accumulated state, we cannot determine:
- Which bc-* branches are already integrated into `next`
- What order they were integrated in historically
- Whether conflicts are from new branches or old integrations
- How to handle updated or deleted bc-* branches

**Non-Deterministic Results**: Each integration attempt would have different starting points, making results unpredictable and unreproducible.

#### Benefits of Ephemeral Branches

**Deterministic Results**: Every integration attempt starts from the same baseline (develop) and applies the same set of breaking changes in the same order, ensuring identical results regardless of previous integration attempts.

**No State Accumulation**: Ephemeral branches prevent issues where:
- Previously integrated bc-* branches would need to be tracked
- New bc-* branches might conflict with old integrated changes rather than with develop
- Integration order becomes unpredictable when some branches are already applied

**Clear Conflict Attribution**: When conflicts occur, they are always between:
- bc-* branches and the current develop state, or
- bc-* branches with each other in the intended integration sequence

This eliminates confusion about whether conflicts come from old integrations or current changes.

**Clean Preview Releases**: Each preview release represents exactly "develop + all current bc-* branches", making it a true preview of what the next major release would contain if shipped immediately.

**Reproducible Integration**: Given the same set of bc-* branches and develop state, the integration will always produce identical results.

### Why GitHub Issues for Conflict Reporting

After evaluating multiple conflict reporting approaches, GitHub issues were chosen as the primary mechanism:

#### Considered Alternatives
1. **GitHub Step Summary only** - Limited visibility outside workflow runs
2. **Slack/Email notifications** - Good for immediate alerts but poor for detailed tracking
3. **Draft PRs for visualization** - Complex to implement and maintain
4. **File-based reports** - No built-in notification or tracking

#### Why GitHub Issues Are Optimal

**Team Familiarity**: The Polymesh team already uses GitHub issues for tracking problems and conflicts, making this approach consistent with existing workflows.

**Rich Content Support**: Issues support full markdown formatting, code blocks, and detailed conflict information with proper formatting.

**Built-in Workflow Integration**: Issues integrate naturally with GitHub's notification system, assignee management, and project tracking.

**Persistent Tracking**: Unlike workflow summaries that are tied to specific runs, issues persist until resolved and can be referenced across multiple integration attempts.

**Searchable History**: Issues create a searchable history of conflicts and their resolutions, valuable for understanding patterns and improving the process.

**Automated Management**: Issues can be automatically closed when conflicts are resolved and integration succeeds.

**Clear Actionability**: Issues provide clear steps for resolution and can be assigned to responsible developers.

**Integration with Existing Tools**: The team's existing issue management, labeling, and notification systems work seamlessly with automated conflict reports.

## Prerequisites

### Repository Requirements
- GitHub repository with Actions enabled
- Default branch (`master`) and integration branch (`develop`)
- Node.js project with package.json
- Yarn package manager configured with Corepack
- Existing semantic-release configuration

### Required Secrets
These secrets are already configured in your repository:
- `ASSOCIATION_NPM_TOKEN` - Authentication token for npm registry
- `ASSOCIATION_RELEASE_TOKEN` - GitHub token with workflow trigger permissions
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Required Repository Variables
- `MIDDLEWARE_ALLOWED_SIGNERS` - SSH keys for commit signature validation

### Branch Protection Rules
Apply to integration branch (`develop`):
- ✅ Require linear history
- ✅ Require status checks to pass
- ✅ Restrict force pushes
- ✅ Include administrators in restrictions

## Workflow Files

### 1. Main Integration Workflow

Create `.github/workflows/generate-next-preview.yml`:

```yaml
name: Generate Next Major Preview

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Preview release type for semantic-release'
        required: false
        default: 'next-major'
        type: choice
        options:
          - next-major
          - alpha-major
          - beta-major
          - rc-major
      debug_mode:
        description: 'Enable debug logging'
        required: false
        default: false
        type: boolean
  schedule:
    # Optional: Run weekly on Sundays at 2 AM UTC
    - cron: '0 2 * * 0'

# Security: Minimal permissions following principle of least privilege
permissions:
  contents: write
  issues: write
  pull-requests: read
  packages: write

# Prevent concurrent runs to avoid conflicts
concurrency:
  group: generate-next-preview
  cancel-in-progress: false

env:
  # Enable debug logging if requested
  ACTIONS_STEP_DEBUG: ${{ github.event.inputs.debug_mode == 'true' && 'true' || '' }}

jobs:
  generate-preview:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    outputs:
      preview_version: ${{ steps.publish.outputs.preview_version }}
      breaking_changes_found: ${{ steps.discovery.outputs.found }}
      conflicts_detected: ${{ steps.validation.outputs.all_clean == 'false' }}
      npm_package_url: ${{ steps.publish.outputs.package_url }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
          cache: 'yarn'

      - name: Enable Corepack (for Yarn)
        run: corepack enable

      - name: Configure Git
        run: |
          git config --global user.name "Release Bot"
          git config --global user.email "release-bot@polymesh.network"

      - name: Install dependencies
        run: |
          yarn install --immutable
          # Security: Verify package integrity
          yarn audit --level=high

      - name: Discover breaking change branches
        id: discovery
        run: |
          echo "🔍 Discovering breaking change branches..."

          # Fetch all remote branches to ensure they're available locally
          git fetch --all --prune

          # Find all bc-<number>-* branches and sort numerically
          BC_BRANCHES=$(git branch -r | grep -E 'origin/bc-[0-9]+-' | sed 's/origin\///' | while read -r branch; do
            number=$(echo "$branch" | sed -n 's/bc-\([0-9]\+\)-.*/\1/p')
            if [[ "$number" =~ ^[0-9]+$ ]]; then
              echo "$number $branch"
            fi
          done | sort -n | awk '{print $2}' | tr '\n' ' ')

          echo "BC_BRANCHES=$BC_BRANCHES" >> "$GITHUB_ENV"

          if [[ -z "$BC_BRANCHES" ]]; then
            echo "found=false" >> "$GITHUB_OUTPUT"
            echo "ℹ️ No breaking change branches found"
            echo "## 📋 Branch Discovery Results" >> $GITHUB_STEP_SUMMARY
            echo "No breaking change branches (bc-*) were found." >> $GITHUB_STEP_SUMMARY
            echo "Breaking changes should use the naming pattern: \`bc-<number>-<description>\`" >> $GITHUB_STEP_SUMMARY
          else
            echo "found=true" >> "$GITHUB_OUTPUT"
            echo "✅ Found breaking change branches: $BC_BRANCHES"

            # Add to GitHub Step Summary
            echo "## 📋 Branch Discovery Results" >> $GITHUB_STEP_SUMMARY
            echo "Found the following breaking change branches:" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            for branch in $BC_BRANCHES; do
              echo "- \`$branch\`" >> $GITHUB_STEP_SUMMARY
            done
          fi

      - name: Validate breaking change compatibility
        if: steps.discovery.outputs.found == 'true'
        id: validation
        run: |
          echo "🔄 Validating breaking change branches with sequential integration test..."

          ALL_CLEAN=true
          CLEAN_BRANCHES=""
          CONFLICTED_BRANCHES=""
          VALIDATION_DETAILS=""

          # Create temporary integration branch for full sequence validation
          TEMP_VALIDATION_BRANCH="temp-sequential-validation-$(date +%Y%m%d%H%M%S)"
          git checkout -b "$TEMP_VALIDATION_BRANCH" origin/develop
          echo "📝 Created temporary validation branch: $TEMP_VALIDATION_BRANCH"

          # Test the full integration sequence exactly as it will be performed
          for branch in $BC_BRANCHES; do
            echo "🔍 Validating sequential integration of: $branch"

            # Get commits from this branch not in develop (same as integration step)
            COMMITS=$(git rev-list --reverse "origin/develop..origin/$branch" 2>/dev/null || echo "")

            if [[ -z "$COMMITS" ]]; then
              echo "⚠️ No new commits found in $branch (may be already integrated)"
              CLEAN_BRANCHES="$CLEAN_BRANCHES $branch"
              continue
            fi

            # Count commits for reporting
            COMMIT_COUNT=$(echo "$COMMITS" | wc -l | xargs)
            echo "  Found $COMMIT_COUNT commit(s) to validate"

            # Try to cherry-pick each commit in chronological order (mirroring integration)
            BRANCH_CLEAN=true
            for commit in $COMMITS; do
              COMMIT_MSG=$(git log -1 --format="%s" "$commit")
              echo "  Testing cherry-pick: $commit ($COMMIT_MSG)"

              if git cherry-pick "$commit" --no-commit 2>/dev/null; then
                git commit -m "temp: $(git log -1 --format="%s" "$commit")" --no-verify
                echo "  ✅ Sequential integration test passed: $commit"
              else
                echo "  ❌ Sequential integration conflict detected: $commit"

                # Capture detailed conflict information
                CONFLICTED_FILES=$(git status --porcelain | grep "^UU\|^AA\|^DD" | awk '{print $2}' | tr '\n' ' ')
                CONFLICT_INFO="Branch: $branch\nCommit: $commit\nMessage: $COMMIT_MSG\nConflicted files: $CONFLICTED_FILES\nConflict type: Sequential integration (conflicts with previously applied changes)"

                if [[ -z "$VALIDATION_DETAILS" ]]; then
                  VALIDATION_DETAILS="$CONFLICT_INFO"
                else
                  VALIDATION_DETAILS="$VALIDATION_DETAILS\n\n$CONFLICT_INFO"
                fi

                CONFLICTED_BRANCHES="$CONFLICTED_BRANCHES $branch"
                git cherry-pick --abort 2>/dev/null || git reset --hard
                BRANCH_CLEAN=false
                ALL_CLEAN=false
                break
              fi
            done

            # Track branch status
            if [[ "$BRANCH_CLEAN" == "true" ]]; then
              CLEAN_BRANCHES="$CLEAN_BRANCHES $branch"
              echo "✅ $branch - sequential integration successful"
            else
              echo "❌ $branch - sequential integration failed"
              # Stop processing remaining branches since we found a conflict
              break
            fi
          done

          # Cleanup temporary validation branch
          git checkout develop
          git branch -D "$TEMP_VALIDATION_BRANCH"
          echo "🧹 Cleaned up temporary validation branch"

          # Set environment variables for later steps
          echo "CLEAN_BRANCHES=$CLEAN_BRANCHES" >> "$GITHUB_ENV"
          echo "CONFLICTED_BRANCHES=$CONFLICTED_BRANCHES" >> "$GITHUB_ENV"
          echo -e "$VALIDATION_DETAILS" > validation_conflicts.txt

          # Add to GitHub Step Summary
          echo "## 🔍 Validation Results" >> $GITHUB_STEP_SUMMARY

          if [[ "$ALL_CLEAN" == "true" ]]; then
            echo "all_clean=true" >> "$GITHUB_OUTPUT"
            echo "✅ Sequential integration validation passed - all breaking changes apply cleanly in order"
            echo "✅ Proceeding with integration (guaranteed to succeed)"

            echo "✅ **All breaking changes validated successfully!**" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "Clean branches:" >> $GITHUB_STEP_SUMMARY
            for branch in $CLEAN_BRANCHES; do
              echo "- ✅ \`$branch\`" >> $GITHUB_STEP_SUMMARY
            done
          else
            echo "all_clean=false" >> "$GITHUB_OUTPUT"
            echo "❌ RELEASE BLOCKED: Sequential integration conflicts detected in branches:$CONFLICTED_BRANCHES"
            echo "❌ Conflicts occur when applying breaking changes in numerical order"
            echo "❌ No preview release will be generated until all conflicts are resolved"

            echo "❌ **Release blocked due to conflicts!**" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "Conflicted branches:$CONFLICTED_BRANCHES" >> $GITHUB_STEP_SUMMARY
          fi

      - name: Create ephemeral integration branch
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        run: |
          # Create temporary integration branch from latest develop
          INTEGRATION_BRANCH="ephemeral-integration-$(date +%Y%m%d%H%M%S)"
          echo "INTEGRATION_BRANCH=$INTEGRATION_BRANCH" >> "$GITHUB_ENV"

          git checkout -b "$INTEGRATION_BRANCH" origin/develop
          echo "📝 Created ephemeral integration branch: $INTEGRATION_BRANCH"

      - name: Cherry-pick breaking changes
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        id: integration
        run: |
          echo "🚀 Cherry-picking breaking changes (all branches pre-validated as conflict-free)..."

          BREAKING_CHANGE_METADATA=""
          INTEGRATED_COMMITS=""
          TOTAL_COMMITS=0

          for branch in $BC_BRANCHES; do
            echo "📦 Processing branch: $branch"

            # Get commits from this branch not in develop
            COMMITS=$(git rev-list --reverse "origin/develop..origin/$branch" 2>/dev/null || echo "")

            if [[ -z "$COMMITS" ]]; then
              echo "⚠️ No new commits found in $branch"
              continue
            fi

            # Cherry-pick each commit in chronological order
            for commit in $COMMITS; do
              COMMIT_MSG=$(git log -1 --format="%s" "$commit")
              COMMIT_BODY=$(git log -1 --format="%b" "$commit")
              COMMIT_AUTHOR=$(git log -1 --format="%an <%ae>" "$commit")
              echo "Applying commit: $commit ($COMMIT_MSG)"

              # Cherry-pick will succeed since we pre-validated
              git cherry-pick "$commit"
              INTEGRATED_COMMITS="$INTEGRATED_COMMITS $commit"
              TOTAL_COMMITS=$((TOTAL_COMMITS + 1))
              echo "✅ Successfully applied: $commit"

              # Parse breaking change metadata if this is a breaking change commit
              if [[ "$COMMIT_MSG" == *"!"* ]] && [[ "$COMMIT_BODY" == *"BREAKING CHANGE:"* ]]; then
                # Extract structured metadata
                CATEGORY=$(echo "$COMMIT_BODY" | grep "Breaking-Change-Category:" | cut -d: -f2- | xargs || echo "")
                IMPACT=$(echo "$COMMIT_BODY" | grep "Breaking-Change-Impact:" | cut -d: -f2- | xargs || echo "")
                MIGRATION=$(echo "$COMMIT_BODY" | grep "Breaking-Change-Migration:" | cut -d: -f2- | xargs || echo "")
                AFFECTS=$(echo "$COMMIT_BODY" | grep "Breaking-Change-Affects:" | cut -d: -f2- | xargs || echo "")
                DESCRIPTION=$(echo "$COMMIT_BODY" | sed -n '/BREAKING CHANGE:/,/^$/p' | sed '1s/BREAKING CHANGE: *//' | head -n 1)

                # Build metadata entry for release notes
                BC_ENTRY="### ${COMMIT_MSG}\n"
                BC_ENTRY="${BC_ENTRY}- **Category**: ${CATEGORY:-Unknown}\n"
                BC_ENTRY="${BC_ENTRY}- **Impact**: ${IMPACT:-Unknown}\n"
                BC_ENTRY="${BC_ENTRY}- **Description**: ${DESCRIPTION:-No description}\n"
                if [[ -n "$MIGRATION" ]]; then
                  BC_ENTRY="${BC_ENTRY}- **Migration**: ${MIGRATION}\n"
                fi
                if [[ -n "$AFFECTS" ]]; then
                  BC_ENTRY="${BC_ENTRY}- **Affects**: ${AFFECTS}\n"
                fi
                BC_ENTRY="${BC_ENTRY}- **Branch**: \`${branch}\`\n"
                BC_ENTRY="${BC_ENTRY}- **Commit**: \`${commit:0:7}\`\n"
                BC_ENTRY="${BC_ENTRY}- **Author**: ${COMMIT_AUTHOR}\n\n"

                BREAKING_CHANGE_METADATA="${BREAKING_CHANGE_METADATA}${BC_ENTRY}"
              fi
            done
          done

          # Set outputs for downstream steps
          {
            echo "SUCCESSFUL_BRANCHES=$BC_BRANCHES"
            echo "INTEGRATED_COMMITS=$INTEGRATED_COMMITS"
            echo "TOTAL_COMMITS=$TOTAL_COMMITS"
            echo "BREAKING_CHANGE_METADATA<<EOF"
            echo -e "$BREAKING_CHANGE_METADATA"
            echo "EOF"
          } >> "$GITHUB_ENV"
          echo "✅ All breaking changes applied successfully ($TOTAL_COMMITS commits integrated)"

      - name: Run tests
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        run: |
          echo "🧪 Running tests on integrated codebase..."
          yarn test
          echo "✅ Tests passed successfully"

      - name: Build integrated codebase
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        run: |
          echo "🔨 Building integrated codebase..."
          yarn build:ts

          # Validate build outputs
          if [[ ! -d "dist" ]]; then
            echo "❌ Build failed: dist directory not found"
            exit 1
          fi

          echo "✅ Build completed successfully"

      - name: Prepare package for semantic-release
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        run: |
          echo "📦 Preparing package structure for semantic-release..."

          # Build and prepare the package structure
          yarn build:ts
          sed 's/dist\//.\\//' package.json > dist/package.json
          cp README.md dist/README.md
          cp yarn.lock dist/yarn.lock
          cp release.config.next-major.js dist/

          echo "✅ Package prepared for semantic-release"

          # Add to GitHub Step Summary
          echo "## 📦 Package Preparation" >> $GITHUB_STEP_SUMMARY
          echo "Package prepared for semantic-release with next-major configuration" >> $GITHUB_STEP_SUMMARY

      - name: Release with semantic-release
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        id: publish
        run: |
          echo "🚀 Running semantic-release for preview package..."

          # Change to dist directory where the built package is
          cd dist

          # Install dependencies for the built package
          yarn install --immutable

          # Run semantic-release with next-major configuration
          yarn semantic-release --extends ./release.config.next-major.js

          # Capture version for output
          RELEASED_VERSION=$(node -p "require('./package.json').version")
          PACKAGE_NAME=$(node -p "require('./package.json').name")

          echo "preview_version=$RELEASED_VERSION" >> "$GITHUB_OUTPUT"
          echo "package_url=https://www.npmjs.com/package/$PACKAGE_NAME/v/$RELEASED_VERSION" >> "$GITHUB_OUTPUT"

          echo "✅ Preview package released: $PACKAGE_NAME@$RELEASED_VERSION"

          # Add to GitHub Step Summary
          echo "## 🚀 Released Package" >> $GITHUB_STEP_SUMMARY
          echo "[\`$PACKAGE_NAME@$RELEASED_VERSION\`](https://www.npmjs.com/package/$PACKAGE_NAME/v/$RELEASED_VERSION)" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Install with:" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`bash" >> $GITHUB_STEP_SUMMARY
          echo "npm install $PACKAGE_NAME@$RELEASED_VERSION" >> $GITHUB_STEP_SUMMARY
          echo "# or" >> $GITHUB_STEP_SUMMARY
          echo "yarn add $PACKAGE_NAME@$RELEASED_VERSION" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
        env:
          GITHUB_TOKEN: ${{ secrets.ASSOCIATION_RELEASE_TOKEN }}
          NPM_TOKEN: ${{ secrets.ASSOCIATION_NPM_TOKEN }}

      - name: Update release with additional metadata
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'true'
        run: |
          echo "📝 Semantic-release has automatically created the GitHub release"
          echo "Additional breaking change metadata:"
          echo "${{ env.BREAKING_CHANGE_METADATA || 'No breaking changes detected in commit metadata.' }}"
          echo ""
          echo "Integrated branches: ${{ env.SUCCESSFUL_BRANCHES }}"
          echo "Total commits integrated: ${{ env.TOTAL_COMMITS }}"

          # Add to GitHub Step Summary
          echo "## 🚀 Release Created" >> $GITHUB_STEP_SUMMARY
          echo "Semantic-release has automatically created the GitHub release with:" >> $GITHUB_STEP_SUMMARY
          echo "- Automated version calculation based on conventional commits" >> $GITHUB_STEP_SUMMARY
          echo "- Generated release notes from commit messages" >> $GITHUB_STEP_SUMMARY
          echo "- NPM package publication with next-major tag" >> $GITHUB_STEP_SUMMARY

      - name: Check for stale branches
        if: steps.discovery.outputs.found == 'true'
        id: staleness
        run: |
          STALE_BRANCHES=""

          for branch in $BC_BRANCHES; do
            COMMITS_BEHIND=$(git rev-list --count "origin/$branch..origin/develop" 2>/dev/null || echo "0")

            if [[ "$COMMITS_BEHIND" -gt 50 ]]; then
              echo "⚠️ $branch is $COMMITS_BEHIND commits behind develop"
              STALE_BRANCHES="$STALE_BRANCHES $branch"
            fi
          done

          echo "STALE_BRANCHES=$STALE_BRANCHES" >> "$GITHUB_ENV"

          if [[ -n "$STALE_BRANCHES" ]]; then
            echo "stale_found=true" >> "$GITHUB_OUTPUT"
          else
            echo "stale_found=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Report release blocked due to conflicts
        if: steps.discovery.outputs.found == 'true' && steps.validation.outputs.all_clean == 'false'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const allBranches = process.env.BC_BRANCHES.trim().split(' ').filter(b => b);
            const cleanBranches = process.env.CLEAN_BRANCHES ? process.env.CLEAN_BRANCHES.trim().split(' ').filter(b => b) : [];
            const conflictedBranches = process.env.CONFLICTED_BRANCHES.trim().split(' ').filter(b => b);

            const title = `🚨 Next Major Release Blocked - Integration Conflicts Detected`;
            const body = `# Release Status: BLOCKED ❌

            The next major preview release has been **completely blocked** due to **sequential integration conflicts** detected during comprehensive validation.

            ## Validation Method: Sequential Integration Test

            This system tests the **full integration sequence** exactly as it will be performed:
            1. Start with \`develop\` branch
            2. Apply \`bc-1\` changes → \`bc-2\` changes → \`bc-3\` changes... in numerical order
            3. Block release if **any step** in this sequence conflicts

            ## Branch Status Summary (Sequential Order)

            ${allBranches.map(branch => {
              const status = conflictedBranches.includes(branch) ? '❌ Sequential Conflict' : '✅ Sequential Integration Clean';
              return `- \`${branch}\`: ${status}`;
            }).join('\n')}

            ## Root Cause: Sequential Integration Conflicts

            The conflicted branch(es) may apply cleanly against \`develop\` individually, but **conflict when applied in the numerical sequence** after previous breaking changes:

            ${conflictedBranches.map(branch => `- \`${branch}\`: Conflicts with changes from previously applied bc-* branches`).join('\n')}

            ## Resolution Required

            **ALL conflicted branches must be resolved before ANY release can proceed.**

            ### Resolution Steps

            1. **Checkout the conflicted branch locally**:
               \`\`\`bash
               git checkout ${conflictedBranches[0] || '<conflicted-branch>'}
               git fetch origin develop
               \`\`\`

            2. **Create a temporary integration branch to test the sequence**:
               \`\`\`bash
               git checkout -b temp-integration develop
               # Apply clean branches first (in order)
               ${cleanBranches.map(b => `git cherry-pick \$(git rev-list --reverse origin/develop..origin/${b})`).join('\n               ')}
               # Now your conflicted branch should rebase cleanly against this state
               \`\`\`

            3. **Rebase the conflicted branch against the integrated state**:
               \`\`\`bash
               git checkout ${conflictedBranches[0] || '<conflicted-branch>'}
               git rebase temp-integration
               # Resolve any conflicts that appear
               git add .
               git rebase --continue
               \`\`\`

            4. **Test locally** to ensure changes work correctly

            5. **Force push the updated branch**:
               \`\`\`bash
               git push --force-with-lease origin ${conflictedBranches[0] || '<conflicted-branch>'}
               \`\`\`

            6. **Clean up temporary branch**:
               \`\`\`bash
               git branch -D temp-integration
               \`\`\`

            7. **Manually trigger workflow** after ALL conflicts resolved:
               - Go to [Actions tab](../../actions)
               - Select "Generate Next Major Preview" workflow
               - Click "Run workflow"

            ## Conflict Details

            \`\`\`
            ${fs.existsSync('validation_conflicts.txt') ? fs.readFileSync('validation_conflicts.txt', 'utf8') : 'Conflict details not available'}
            \`\`\`

            ## No Partial Releases

            This system uses **zero-tolerance conflict prevention**:
            - ❌ No preview release generated
            - ❌ No npm package published
            - ❌ No GitHub release created
            - ⚠️ Manual workflow dispatch required after resolution

            ## Why This Approach?

            This strict approach ensures that:
            - Preview releases are always functional and complete
            - Integration conflicts are caught early, before they affect other developers
            - The next major release will have a clean, predictable integration
            - No partially-integrated state ever reaches published packages

            ---
            **Triggered by**: ${{ github.sha }}
            **Workflow run**: [#${{ github.run_id }}](../../actions/runs/${{ github.run_id }})
            **Auto-generated by**: Ephemeral Next Major Release Integration`;

            // Create issue
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['breaking-changes', 'conflicts', 'release-blocked', 'automation']
            });

      - name: Report stale branches
        if: steps.staleness.outputs.stale_found == 'true'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const staleBranches = process.env.STALE_BRANCHES.trim().split(' ').filter(b => b);

            const title = `⚠️ Stale Breaking Change Branches Detected`;
            const body = `# Stale Breaking Change Branches

            The following breaking change branches are significantly behind develop:

            ${staleBranches.map(b => `- \`${b}\``).join('\n')}

            ## Recommendation

            Rebase these branches to avoid future conflicts:

            \`\`\`bash
            git checkout <branch-name>
            git fetch origin develop
            git rebase origin/develop
            git push --force-with-lease origin <branch-name>
            \`\`\`

            Branches more than 50 commits behind develop have higher conflict risk and should be updated before the next integration attempt.

            ## Why This Matters

            Stale branches are more likely to:
            - Conflict during sequential integration
            - Block the entire release process
            - Require more complex conflict resolution
            - Affect other breaking changes in the sequence

            Regular rebasing keeps branches current and reduces integration complexity.

            ---
            **Auto-generated by**: Ephemeral Next Major Release Integration`;

            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: title,
              body: body,
              labels: ['breaking-changes', 'maintenance', 'stale-branches']
            });

      - name: Cleanup ephemeral resources
        if: always()
        run: |
          echo "🧹 Cleaning up ephemeral resources..."

          # Clean up temporary files
          rm -f validation_conflicts.txt

          # Reset to original state (ephemeral branch will be garbage collected)
          git checkout develop 2>/dev/null || git checkout ${{ github.ref_name }}

          if [[ -n "${INTEGRATION_BRANCH:-}" ]]; then
            git branch -D "$INTEGRATION_BRANCH" 2>/dev/null || true
          fi

          echo "✅ Cleanup completed"
```

### 2. Branch Name Validation Workflow

Create `.github/workflows/validate-bc-branches.yml`:

```yaml
name: Validate Breaking Change Branch Names

on:
  pull_request:
    branches: [develop]
  push:
    branches: ['bc-**']
  create:
    branches: ['bc-**']

jobs:
  validate-branch-name:
    if: startsWith(github.ref_name, 'bc-') || startsWith(github.head_ref, 'bc-')
    runs-on: ubuntu-latest

    steps:
      - name: Extract branch name
        id: extract_branch
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            BRANCH_NAME="${{ github.head_ref }}"
          else
            BRANCH_NAME="${{ github.ref_name }}"
          fi
          echo "branch_name=$BRANCH_NAME" >> "$GITHUB_OUTPUT"
          echo "Validating branch: $BRANCH_NAME"

      - name: Validate branch naming convention
        run: |
          BRANCH_NAME="${{ steps.extract_branch.outputs.branch_name }}"

          # Check if branch follows bc-<number>-<description> pattern
          if ! echo "$BRANCH_NAME" | grep -E '^bc-[0-9]+-[a-z0-9-]+$'; then
            echo "❌ Invalid branch name: $BRANCH_NAME"
            echo ""
            echo "✅ Expected format: bc-<number>-<description>"
            echo ""
            echo "Examples of valid branch names:"
            echo "  - bc-1-remove-deprecated-apis"
            echo "  - bc-10-async-interface-changes"
            echo "  - bc-25-new-error-handling"
            echo ""
            echo "Branch naming rules:"
            echo "  - Must start with 'bc-'"
            echo "  - Must include a number (determines integration order)"
            echo "  - Must include a descriptive name with hyphens"
            echo "  - Only lowercase letters, numbers, and hyphens allowed"
            echo ""
            echo "The number determines the order in which breaking changes are applied:"
            echo "  - bc-1-* is applied first"
            echo "  - bc-2-* is applied second"
            echo "  - bc-10-* is applied after bc-2-* but before bc-15-*"
            exit 1
          fi

          echo "✅ Branch name validation passed for: $BRANCH_NAME"

      - name: Extract and validate branch number
        run: |
          BRANCH_NAME="${{ steps.extract_branch.outputs.branch_name }}"
          BRANCH_NUMBER=$(echo "$BRANCH_NAME" | sed -n 's/^bc-\([0-9]\+\)-.*/\1/p')

          if [ -z "$BRANCH_NUMBER" ]; then
            echo "❌ Could not extract branch number from: $BRANCH_NAME"
            exit 1
          fi

          echo "📋 Branch details:"
          echo "  - Branch name: $BRANCH_NAME"
          echo "  - Branch number: $BRANCH_NUMBER"
          echo "  - Integration order: This branch will be applied as #${BRANCH_NUMBER} in the sequence"

          # Warnings for unusual numbers
          if [ "$BRANCH_NUMBER" -lt 1 ] || [ "$BRANCH_NUMBER" -gt 999 ]; then
            echo "⚠️  Warning: Branch number $BRANCH_NUMBER is outside recommended range (1-999)"
          fi

          if [ "$BRANCH_NUMBER" -gt 50 ]; then
            echo "⚠️  Warning: High branch numbers (>50) may indicate too many breaking changes for a single major release"
            echo "Consider whether all these changes need to be in the same major version"
          fi

          # Add summary to PR if this is a pull request
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            echo "## Breaking Change Branch Information" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "- **Branch**: \`$BRANCH_NAME\`" >> $GITHUB_STEP_SUMMARY
            echo "- **Integration Order**: #$BRANCH_NUMBER" >> $GITHUB_STEP_SUMMARY
            echo "- **Status**: ✅ Valid naming convention" >> $GITHUB_STEP_SUMMARY
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "This branch will be automatically discovered and integrated in position $BRANCH_NUMBER when the next major preview is generated." >> $GITHUB_STEP_SUMMARY
          fi

      - name: Check for number conflicts
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const branchName = '${{ steps.extract_branch.outputs.branch_name }}';
            const match = branchName.match(/^bc-(\d+)-/);
            if (!match) return;

            const branchNumber = parseInt(match[1]);

            // Get all branches
            const { data: branches } = await github.rest.repos.listBranches({
              owner: context.repo.owner,
              repo: context.repo.repo,
              per_page: 100
            });

            // Find other bc-* branches with the same number
            const conflicts = branches
              .map(b => b.name)
              .filter(name => name.startsWith('bc-'))
              .filter(name => name !== branchName)
              .filter(name => {
                const m = name.match(/^bc-(\d+)-/);
                return m && parseInt(m[1]) === branchNumber;
              });

            if (conflicts.length > 0) {
              console.log(`⚠️ Warning: Found other branches with the same number (${branchNumber}):`);
              conflicts.forEach(b => console.log(`  - ${b}`));
              console.log('\nConsider using a different number to avoid confusion.');

              // Add warning to summary
              await core.summary
                .addHeading('⚠️ Number Conflict Warning', 3)
                .addRaw(`Found ${conflicts.length} other branch(es) using number ${branchNumber}:`)
                .addList(conflicts.map(b => `\`${b}\``))
                .write();
            }
```

### 3. Update Existing Breaking Changes Workflow

Modify `.github/workflows/breaking-changes.yml` to exempt bc-* branches:

```yaml
name: Develop Breaking Changes Check

on:
  pull_request:
    types: [assigned, opened, reopened, synchronize]
    branches: [develop]

jobs:
  check-breaking-changes:
    # Skip this check for bc-* branches (they're meant for breaking changes)
    if: "!startsWith(github.head_ref, 'bc-')"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check commit messages for breaking changes
        env:
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
        run: |
          # Get all commits in the PR
          commits=$(git rev-list $BASE_SHA..$HEAD_SHA)

          # Check each commit for breaking changes
          for commit in $commits; do
            commit_msg=$(git show --pretty="format:%s" --no-patch $commit)
            commit_body=$(git show --pretty="format:%b" --no-patch $commit)

            # Check for breaking change indicators
            if [[ "$commit_msg" == *"!"* ]] || [[ "$commit_body" == *"BREAKING CHANGE:"* ]]; then
              echo "❌ Breaking change detected in commit $commit"
              echo ""
              echo "Breaking changes should not be merged directly to develop."
              echo "Please create a breaking change branch instead:"
              echo ""
              echo "1. Create a new branch: bc-<number>-<description>"
              echo "2. Cherry-pick or move your commits there"
              echo "3. Push the bc-* branch"
              echo "4. Breaking changes will be integrated in the next major release"
              echo ""
              echo "Example:"
              echo "  git checkout -b bc-1-remove-deprecated-api develop"
              echo "  git cherry-pick $commit"
              echo "  git push origin bc-1-remove-deprecated-api"
              exit 1
            fi
          done

          echo "✅ No breaking changes detected - safe to merge to develop"

  # Keep existing check-api-snapshot job unchanged
  check-api-snapshot:
    name: Validate API snapshot
    runs-on: ubuntu-latest
    # ... rest of existing API snapshot validation logic
```

### 4. Update Auto-Rebase Workflow

Modify `.github/workflows/auto-rebase.yml` to handle bc-* branches appropriately:

```yaml
name: Auto Rebase Next onto Develop

on:
  push:
    branches:
      - develop

jobs:
  check-for-bc-branches:
    runs-on: ubuntu-latest
    outputs:
      has_bc_branches: ${{ steps.check.outputs.has_bc_branches }}
      bc_branches: ${{ steps.check.outputs.bc_branches }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for active bc-* branches
        id: check
        run: |
          git fetch --all
          BC_BRANCHES=$(git branch -r | grep -E 'origin/bc-[0-9]+-' | sed 's/origin\///' | tr '\n' ' ')

          if [[ -n "$BC_BRANCHES" ]]; then
            echo "has_bc_branches=true" >> "$GITHUB_OUTPUT"
            echo "bc_branches=$BC_BRANCHES" >> "$GITHUB_OUTPUT"
            echo "⚠️ Found active bc-* branches: $BC_BRANCHES"
            echo "Auto-rebase of next branch will be skipped to avoid conflicts with breaking changes."
          else
            echo "has_bc_branches=false" >> "$GITHUB_OUTPUT"
            echo "bc_branches=" >> "$GITHUB_OUTPUT"
            echo "✅ No active bc-* branches found. Auto-rebase can proceed."
          fi

  notify-bc-branches-present:
    runs-on: ubuntu-latest
    needs: check-for-bc-branches
    if: needs.check-for-bc-branches.outputs.has_bc_branches == 'true'
    steps:
      - name: Create informational issue
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const bcBranches = '${{ needs.check-for-bc-branches.outputs.bc_branches }}';
            const title = 'ℹ️ Auto-rebase skipped - Breaking change branches active';
            const body = `# Auto-rebase Temporarily Disabled

            Auto-rebasing of the \`next\` branch onto \`develop\` has been automatically disabled because active breaking change branches were detected:

            ${bcBranches.split(' ').filter(b => b).map(b => `- \`${b}\``).join('\n')}

            ## Why This Happens

            When bc-* branches are active, auto-rebasing the \`next\` branch could:
            - Interfere with the breaking change integration process
            - Create conflicts with the ephemeral integration branches
            - Lead to inconsistent state between \`next\` and the integrated breaking changes

            ## What This Means

            - The \`next\` branch will not be automatically updated until all bc-* branches are integrated
            - Breaking changes will be properly integrated through the next major release process
            - Auto-rebasing will resume once all bc-* branches are processed and integrated

            ## Next Steps

            1. Let the breaking change integration process complete
            2. After successful integration, bc-* branches will be cleaned up
            3. Auto-rebasing will automatically resume on the next push to develop

            This is normal operation and requires no action from maintainers.

            ---
            **Auto-generated by**: Auto-rebase workflow`;

            // Check if similar issue already exists
            const { data: issues } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'auto-rebase,breaking-changes'
            });

            const existingIssue = issues.find(issue =>
              issue.title.includes('Auto-rebase skipped') &&
              issue.labels.some(label => label.name === 'auto-rebase')
            );

            if (existingIssue) {
              // Update existing issue
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: existingIssue.number,
                body: body
              });
              console.log(`Updated existing issue #${existingIssue.number}`);
            } else {
              // Create new issue
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: title,
                body: body,
                labels: ['auto-rebase', 'breaking-changes', 'automated']
              });
              console.log('Created new informational issue');
            }

  rebase-next:
    needs: check-for-bc-branches
    if: needs.check-for-bc-branches.outputs.has_bc_branches == 'false'
    runs-on: ubuntu-latest
    steps:
      # ... existing auto-rebase logic unchanged ...
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Git
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"

      # ... rest of existing rebase logic ...

  close-auto-rebase-issues:
    needs: check-for-bc-branches
    if: needs.check-for-bc-branches.outputs.has_bc_branches == 'false'
    runs-on: ubuntu-latest
    steps:
      - name: Close auto-rebase informational issues
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            // Close any open auto-rebase informational issues since we can now rebase
            const { data: issues } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'auto-rebase,breaking-changes'
            });

            for (const issue of issues) {
              if (issue.title.includes('Auto-rebase skipped')) {
                await github.rest.issues.update({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: issue.number,
                  state: 'closed'
                });

                await github.rest.issues.createComment({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  issue_number: issue.number,
                  body: '✅ Auto-rebase has resumed - no more active bc-* branches detected.'
                });

                console.log(`Closed issue #${issue.number}`);
              }
            }
```

## Configuration

### 1. Semantic-Release Configuration for Next-Major

Create `release.config.next-major.js`:

```javascript
module.exports = {
  repositoryUrl: 'https://github.com/PolymeshAssociation/polymesh-sdk.git',
  branches: [
    {
      name: 'ephemeral-integration-*',
      prerelease: 'next-major.${name.replace(/^ephemeral-integration-/, "")}',
      channel: 'next-major'
    }
  ],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG-NEXT-MAJOR.md',
      }
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        tarballDir: 'npm-package/',
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: ['CHANGELOG-NEXT-MAJOR.md'],
        addReleases: 'bottom',
        releasedLabels: ['Status: Released in Next Major Preview']
      }
    ],
  ],
};
```

### 2. Update Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "preview:generate": "gh workflow run generate-next-preview.yml",
    "preview:validate": "bash scripts/validate-bc-branches.sh",
  }
}
```

## Supporting Scripts

### 1. Branch Discovery Script

Create `scripts/discover-bc-branches.sh`:

```bash
#!/bin/bash
set -e

echo "🔍 Discovering breaking change branches..."

# Fetch all remote branches
git fetch --all --prune

# Find all bc-<number>-* branches and sort numerically
BC_BRANCHES=$(git branch -r | grep -E 'origin/bc-[0-9]+-' | sed 's/origin\///' | while read -r branch; do
  number=$(echo "$branch" | sed -n 's/bc-\([0-9]\+\)-.*/\1/p')
  if [[ "$number" =~ ^[0-9]+$ ]]; then
    echo "$number $branch"
  fi
done | sort -n | awk '{print $2}')

if [[ -z "$BC_BRANCHES" ]]; then
  echo "ℹ️ No breaking change branches found"
  exit 0
fi

echo "✅ Found breaking change branches:"
echo "$BC_BRANCHES" | tr ' ' '\n' | sed 's/^/  - /'

# Output for GitHub Actions
if [[ -n "$GITHUB_OUTPUT" ]]; then
  echo "branches=$BC_BRANCHES" >> "$GITHUB_OUTPUT"
fi

# Output for shell usage
echo "$BC_BRANCHES"
```

### 2. Branch Validation Script

Create `scripts/validate-bc-branches.sh`:

```bash
#!/bin/bash
set -e

BRANCHES=${1:-$(bash scripts/discover-bc-branches.sh)}
BASE_BRANCH=${2:-develop}

echo "🔄 Validating sequential integration of bc-* branches..."
echo "Base branch: $BASE_BRANCH"
echo "Branches to validate: $BRANCHES"

if [[ -z "$BRANCHES" ]]; then
  echo "ℹ️ No branches to validate"
  exit 0
fi

# Create temporary branch for validation
TEMP_BRANCH="temp-validation-$(date +%Y%m%d%H%M%S)"
git checkout -b "$TEMP_BRANCH" "origin/$BASE_BRANCH"

ALL_CLEAN=true
CLEAN_BRANCHES=""
CONFLICTED_BRANCHES=""

for branch in $BRANCHES; do
  echo "🔍 Testing integration of: $branch"

  COMMITS=$(git rev-list --reverse "origin/$BASE_BRANCH..origin/$branch" 2>/dev/null || echo "")

  if [[ -z "$COMMITS" ]]; then
    echo "⚠️ No new commits in $branch"
    CLEAN_BRANCHES="$CLEAN_BRANCHES $branch"
    continue
  fi

  # Count commits for reporting
  COMMIT_COUNT=$(echo "$COMMITS" | wc -l | xargs)
  echo "  Found $COMMIT_COUNT commit(s) to validate"

  # Try to cherry-pick each commit
  BRANCH_CLEAN=true
  for commit in $COMMITS; do
    COMMIT_MSG=$(git log -1 --format="%s" "$commit")
    echo "    Testing: $commit ($COMMIT_MSG)"

    if ! git cherry-pick "$commit" --no-commit 2>/dev/null; then
      echo "    ❌ Conflict detected in $branch at commit $commit"
      CONFLICTED_BRANCHES="$CONFLICTED_BRANCHES $branch"
      ALL_CLEAN=false
      BRANCH_CLEAN=false
      git cherry-pick --abort 2>/dev/null || git reset --hard
      break
    fi
    git commit -m "temp: $(git log -1 --format="%s" "$commit")" --no-verify
    echo "    ✅ Applied cleanly"
  done

  if [[ "$BRANCH_CLEAN" == "true" ]]; then
    CLEAN_BRANCHES="$CLEAN_BRANCHES $branch"
    echo "✅ $branch integrates cleanly"
  else
    echo "❌ $branch has conflicts"
    break  # Stop on first conflict
  fi
done

# Cleanup
git checkout "$BASE_BRANCH"
git branch -D "$TEMP_BRANCH"

# Report results
echo ""
echo "📋 Validation Results:"
echo "Clean branches:$CLEAN_BRANCHES"
echo "Conflicted branches:$CONFLICTED_BRANCHES"

if [[ "$ALL_CLEAN" == "true" ]]; then
  echo "✅ All branches validate successfully for sequential integration"
  exit 0
else
  echo "❌ Integration conflicts detected - manual resolution required"
  exit 1
fi
```

Make scripts executable:
```bash
chmod +x scripts/discover-bc-branches.sh scripts/validate-bc-branches.sh
```

## Integration with Existing Infrastructure

### Commit Signing Considerations

Your repository requires ed25519-sk SSH signatures, which presents challenges for automation:

**The Challenge**: GitHub Actions cannot use hardware security keys to sign commits, as they require physical interaction.

**Our Solution**:
1. **Integration commits** (cherry-picks in ephemeral branches) will be bot-signed by GitHub Actions
2. **Original commits** retain their human ed25519-sk signatures from the bc-* branches
3. **Release tags** created by semantic-release will be signed with the GitHub Actions bot key

**Security Implications**:
- Original author signatures are preserved on all actual feature commits
- Only the mechanical integration commits are bot-signed
- The ephemeral nature means these bot-signed commits never enter permanent branches
- Semantic-release creates signed tags for traceability

**Documentation Required**: Update your security documentation to note this exception for the ephemeral integration process.

### Token Usage

This implementation uses your existing tokens:
- `ASSOCIATION_RELEASE_TOKEN` - For triggering workflows and creating releases
- `ASSOCIATION_NPM_TOKEN` - For npm package publication
- `MIDDLEWARE_ALLOWED_SIGNERS` - For commit signature validation

### Semantic-Release Integration

The workflow integrates with your existing semantic-release setup:
- Uses a separate `release.config.next-major.js` for preview releases
- Maintains compatibility with your main release configuration
- Creates releases on the `next-major` channel to avoid conflicts with regular releases
- Preserves conventional commit parsing and automatic version determination

### Workflow Coordination

The system coordinates with your existing workflows:
- **breaking-changes.yml**: Modified to exempt bc-* branches while maintaining protection for develop
- **auto-rebase.yml**: Enhanced to detect bc-* branches and pause auto-rebasing during integration periods
- **main.yml**: Unchanged - continues to handle regular CI/CD for develop and master

## Testing Strategy

### Phase 1: Setup Validation

Test the basic workflow components:

```bash
# 1. Validate branch discovery
scripts/discover-bc-branches.sh

# 2. Test branch naming validation
git checkout -b bc-1-test-feature develop
git push origin bc-1-test-feature
# Should trigger validate-bc-branches.yml

# 3. Test breaking change detection exemption
git checkout bc-1-test-feature
git commit --allow-empty -m "feat!: breaking change test

BREAKING CHANGE: This should not trigger the breaking changes workflow"
git push origin bc-1-test-feature
# Should NOT trigger breaking changes warning
```

### Phase 2: Integration Testing

Test the integration logic:

```bash
# Create test breaking change branches
git checkout -b bc-1-remove-deprecated develop
echo "// Removed deprecated API" >> src/test-changes.ts
git add .
git commit -m "feat!: remove deprecated API

BREAKING CHANGE: Removed old Widget.legacy() method

Breaking-Change-Category: API
Breaking-Change-Impact: High
Breaking-Change-Migration: Replace Widget.legacy() with Widget.current()
Breaking-Change-Affects: All widget consumers"
git push origin bc-1-remove-deprecated

git checkout -b bc-2-update-types develop
echo "// Updated type definitions" >> src/types/test.ts
git add .
git commit -m "feat!: update type definitions"
git push origin bc-2-update-types

# Trigger integration workflow manually
gh workflow run generate-next-preview.yml
```

### Phase 3: Conflict Testing

Test conflict detection:

```bash
# Create conflicting branches
git checkout -b bc-3-conflict-a develop
echo "conflicting content A" > src/conflict-test.ts
git add .
git commit -m "feat!: add conflicting feature A"
git push origin bc-3-conflict-a

git checkout -b bc-4-conflict-b develop
echo "conflicting content B" > src/conflict-test.ts
git add .
git commit -m "feat!: add conflicting feature B"
git push origin bc-4-conflict-b

# Trigger workflow - should detect conflicts and create GitHub issue
gh workflow run generate-next-preview.yml
```

### Phase 4: End-to-End Testing

Validate complete workflow:

```bash
# Clean conflicting branches
git push origin --delete bc-3-conflict-a bc-4-conflict-b

# Trigger successful integration
gh workflow run generate-next-preview.yml

# Verify:
# - Preview package published to npm with next-major tag
# - GitHub release created with proper version
# - All bc-* branches properly integrated
# - No conflicts reported
```

## Rollout Plan

### Week 1: Infrastructure Setup
- [ ] Deploy workflow files to repository
- [ ] Create semantic-release configuration
- [ ] Test branch discovery and validation
- [ ] Validate token permissions and secrets

### Week 2: Controlled Testing
- [ ] Create test bc-* branches
- [ ] Run integration workflow with manual triggers only
- [ ] Test conflict detection and reporting
- [ ] Validate npm publishing with dry-run

### Week 3: Team Training
- [ ] Document bc-* branch creation process
- [ ] Train team on conflict resolution procedures
- [ ] Create troubleshooting guides
- [ ] Test with real breaking changes

### Week 4: Production Deployment
- [ ] Enable scheduled runs
- [ ] Monitor integration success rates
- [ ] Collect team feedback
- [ ] Refine conflict resolution procedures

## Troubleshooting

### Common Issues

#### 1. Branch Discovery Fails
```bash
# Debug branch discovery
git branch -r | grep -E 'origin/bc-[0-9]+-'

# Check naming conventions
echo "bc-1-test-feature" | grep -E '^bc-[0-9]+-[a-z0-9-]+$'
```

#### 2. Integration Conflicts
```bash
# Test integration locally
scripts/validate-bc-branches.sh "bc-1-feature bc-2-feature"

# View conflict details
git status --porcelain
git diff --name-only --diff-filter=U
```

#### 3. Semantic-Release Issues
```bash
# Test semantic-release configuration
cd dist
yarn semantic-release --dry-run --extends ./release.config.next-major.js

# Check token permissions
npm whoami
```

#### 4. Workflow Permissions
```bash
# Check GitHub token permissions
gh api user
gh api repos/:owner/:repo
```

### Debug Mode

Enable detailed logging:

```bash
gh workflow run generate-next-preview.yml -f debug_mode=true
```

Or add to workflow:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Monitoring Commands

```bash
# Watch workflow status
gh run list --workflow=generate-next-preview.yml
gh run watch <run-id>

# Check npm packages
npm view @polymeshassociation/polymesh-sdk versions --json
```

## Security Considerations

### Token Security
- All tokens stored as GitHub Secrets (never in code)
- Minimal required permissions for each token
- Regular token rotation schedule

### Commit Signing
- Original commits maintain ed25519-sk signatures
- Integration commits are bot-signed (documented exception)
- Release tags are signed for traceability

### Branch Protection
- Develop branch maintains all existing protections
- bc-* branches follow same signing requirements
- Ephemeral branches are automatically cleaned up

### Audit Trail
- All integration attempts logged in workflow history
- GitHub issues provide detailed conflict reports
- Semantic-release maintains complete release history

## Maintenance Tasks

### Regular Maintenance
- [ ] Clean up integrated bc-* branches after major releases
- [ ] Update workflow action versions quarterly
- [ ] Review and optimize integration performance
- [ ] Monitor npm package storage costs

### Metrics to Track
- Integration success rate
- Average time to resolve conflicts
- Number of bc-* branches per release cycle
- Workflow execution duration
- Package download statistics

### Quarterly Reviews
- [ ] Evaluate conflict patterns and root causes
- [ ] Review team adoption and feedback
- [ ] Optimize workflow performance
- [ ] Update documentation based on learnings

## Conclusion

This implementation provides a robust, deterministic system for managing breaking changes in the Polymesh SDK while integrating seamlessly with your existing infrastructure. The combination of ephemeral integration branches, semantic-release automation, and comprehensive conflict detection ensures that next major releases are always stable and complete.

The system maintains your strict commit signing requirements where possible while providing necessary exceptions for automation. GitHub issues provide familiar conflict reporting that integrates with your existing workflow management processes.

**Key Success Factors**:
- Ephemeral branches ensure deterministic, reproducible integration
- Zero-tolerance conflict policy prevents partial releases
- Semantic-release provides consistent versioning and publishing
- GitHub issues enable familiar conflict tracking and resolution
- Integration with existing tokens and workflows minimizes disruption

For questions or issues, refer to the troubleshooting section or create an issue in the repository with the `breaking-changes` label.