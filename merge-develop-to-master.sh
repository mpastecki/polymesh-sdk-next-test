#!/bin/bash

set -e  # Exit on any error

echo "🔄 Syncing develop to master with fast-forward merge"
echo ""

# Ensure we're in the develop branch
echo "📍 Checking out develop branch..."
git checkout develop

# Update remote
echo "🔄 Fetching latest changes from remote..."
git fetch origin

# Update develop branch
echo "⬇️  Pulling latest develop..."
git pull origin develop

# Push any local develop changes to remote
echo "⬆️  Pushing local develop changes to remote..."
git push origin develop

# Switch to master
echo "📍 Checking out master branch..."
git checkout master

# Fast-forward merge develop into master
echo "🔀 Merging develop into master (fast-forward only)..."
git merge develop --ff-only

# Push master to remote
echo "⬆️  Pushing master to remote..."
git push origin master

# Switch back to develop
echo "📍 Switching back to develop branch..."
git checkout develop

echo ""
echo "✅ Successfully synced develop to master!"
echo "   - Develop changes pushed to remote"
echo "   - Master is now up to date with develop"
echo "   - Currently on develop branch"