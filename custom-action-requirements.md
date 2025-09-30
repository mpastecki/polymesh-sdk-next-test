# Custom GitHub Action Requirements

## Overview
Create a custom GitHub action that combines commit authentication validation and fast-forward merge functionality for pull requests.

## Core Requirements

### 1. Commit Authentication
- **Verify SSH key signatures** on all commits in a pull request
- **Support allowed signers file** configuration via repository variables
- **Validate commit chain** from base branch to PR head
- **Fail fast** on any unsigned or improperly signed commits
- **Report specific failures** including commit hash and committer information
- **Enforce SSH key type** (optional): Restrict to specific key types (e.g., ed25519-sk)

### 2. Fast-Forward Merge
- **Trigger on comment** containing `/fast-forward` command
- **Verify fast-forward compatibility** before attempting merge
- **Perform atomic merge** operation
- **Handle merge conflicts** gracefully with appropriate error messages
- **Support comment-based feedback** with configurable verbosity levels

### 3. Integration Requirements
- **Single workflow trigger** for both authentication and fast-forward
- **Conditional execution** based on PR state and comment content
- **Permission management** for contents, pull-requests, and issues
- **Token handling** for cross-workflow triggering capabilities

## Technical Specifications

### Input Parameters
```yaml
inputs:
  allowed-signers:
    description: 'Content of SSH allowed signers file'
    required: true
  github-token:
    description: 'GitHub token with appropriate permissions'
    required: true
  comment-mode:
    description: 'Comment feedback level: always, on-error, never'
    required: false
    default: 'on-error'
  merge-method:
    description: 'Merge method: fast-forward, merge'
    required: false
    default: 'fast-forward'
  required-key-type:
    description: 'Required SSH key type (e.g., ed25519-sk, rsa, ecdsa)'
    required: false
```

### Workflow Triggers
- **Pull request events**: opened, reopened, synchronize
- **Issue comment events**: created, edited (filtered for `/fast-forward` command)

### Permissions Required
```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

### Environment Variables
- `GITHUB_TOKEN`: Authentication token
- `ALLOWED_SIGNERS`: SSH public keys for commit verification

## Functional Requirements

### Authentication Phase
1. **Checkout repository** with full history (`fetch-depth: 0`)
2. **Configure Git** with allowed signers file
3. **Extract commit range** from PR base to head
4. **Iterate through commits** and verify signatures
5. **Validate SSH key types** (if required-key-type is specified)
6. **Report results** with detailed failure information

### Fast-Forward Phase
1. **Parse comment** for `/fast-forward` command
2. **Validate PR state** (open, mergeable)
3. **Check fast-forward compatibility**
4. **Execute merge** if validation passes
5. **Post status comment** based on configuration

## Error Handling
- **Authentication failures**: Report specific commit and signer issues
- **Key type violations**: Report commits signed with disallowed key types
- **Fast-forward conflicts**: Provide clear resolution guidance
- **Permission errors**: Indicate required permissions
- **Network issues**: Implement appropriate retry logic

## Security Considerations
- **Token scope validation**: Ensure minimal required permissions
- **SSH key verification**: Validate against trusted signers only
- **Input sanitization**: Prevent command injection in comments
- **Audit logging**: Log all authentication and merge attempts

## Output Requirements
- **Status indicators**: Success/failure for each phase
- **Detailed reporting**: Commit-level authentication results
- **Comment integration**: Contextual feedback on PR
- **Workflow summaries**: High-level operation status

## Compatibility
- **GitHub Enterprise**: Support both cloud and enterprise environments
- **Multiple repositories**: Configurable per-repository settings
- **Branch protection**: Respect existing branch protection rules
- **CI/CD integration**: Work alongside existing workflows