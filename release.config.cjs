// release.config.cjs (or .js)
module.exports = {
    branches: ["main", "test-semantic-release"],
    plugins: [
      ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
      ["@semantic-release/release-notes-generator", {
        preset: "conventionalcommits",
        presetConfig: {
          commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
          compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}'
        },
        writerOpts: {
          // 1) tag commits that look like a PR/merge commit (e.g., "... (#11)")
          transform(commit) {
            if (commit.header && /\(#\d+\)/.test(commit.header)) {
              return { ...commit, isPrTitle: true };
            }
            return commit;
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
            "{{#if prTitle}}{{prTitle}}\n\n{{/if}}",
          // (we keep the default mainTemplate & commit grouping so Features/Fixes render normally)

          // add a 7-char hash for display
          transform: (commit) => ({
            ...commit,
            shortHash: commit.hash ? commit.hash.slice(0, 7) : commit.hash,
          }),
          commitPartial:
            '* {{#if scope}}**{{scope}}:** {{/if}}{{subject}} ' +
            '([{{shortHash}}]({{@root.repoUrl}}/{{@root.commit}}/{{hash}}))' +
            '{{#if references}}, closes {{#each references}}' +
            '[{{this.issue}}]({{@root.repoUrl}}/{{@root.issue}}/{{this.issue}}) {{/each}}{{/if}}\n'
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