// release.config.cjs (or .js)
module.exports = {
    branches: ["main", "test-semantic-release"],
    plugins: [
      ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
      ["@semantic-release/release-notes-generator", {
        preset: "conventionalcommits",
        presetConfig: {
          commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
          compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}',
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'chore', section: 'Chores' },
            { type: 'docs', section: 'Documentation' },
            { type: 'style', section: 'Styles' },
            { type: 'refactor', section: 'Code Refactoring' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'test', section: 'Tests' },
            { type: 'build', section: 'Build System' },
            { type: 'ci', section: 'Continuous Integration' }
          ]
        },
        writerOpts: {
          // 1) tag commits that look like a PR/merge commit (e.g., "... (#11)")
          transform(commit) {
            const transformedCommit = {
              ...commit,
              hash: commit.hash ? commit.hash.slice(0, 7) : commit.hash
            };
            
            if (commit.header && /\(#\d+\)/.test(commit.header)) {
              transformedCommit.isPrTitle = true;
            }
            
            return transformedCommit;
          },
          // 2) lift the first PR-title we find into the global context
          finalizeContext(context, options, commits) {
            if (Array.isArray(commits)) {
              const pr = commits.find(c => c.isPrTitle);
              if (pr) context.prTitle = pr.header || pr.subject;
            }
            return context;
          },
          // 3) print PR title right under the version header, then continue as normal
          headerPartial:
            "## [{{#if version}}{{version}}{{else}}{{currentTag}}{{/if}}]({{compareUrl}}){{#if date}} ({{date}}){{/if}}\n\n" +
            "{{#if prTitle}}{{prTitle}}\n\n{{/if}}"
          // (we keep the default mainTemplate & commit grouping so Features/Fixes render normally)
        }
      }],
      [
        "@semantic-release/changelog",
        {
          changelogFile: "CHANGELOG.md",
          changelogTitle: "# Changelog\n\nAll notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines."
        }
      ],
      [
        "@semantic-release/npm",
        {
          npmPublish: false
        }
      ],
              [
          "@semantic-release/git",
          {
            assets: ["CHANGELOG.md", "package.json"],
            message: "chore(release): ${nextRelease.version} [skip ci]"
          }
        ],
      [
        "@semantic-release/github",
        {
          successComment: false,
          failComment: false,
          releasedLabels: false
        }
      ]
    ]
  };