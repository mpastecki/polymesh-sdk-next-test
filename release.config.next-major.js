module.exports = {
  repositoryUrl: 'https://github.com/PolymeshAssociation/polymesh-sdk.git',
  branches: [
    {
      name: 'ephemeral-integration-*',
      prerelease: 'next-major',
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
        npmPublish: false,
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