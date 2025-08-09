// release.config.cjs (or .js)
module.exports = {
    branches: ["main", "test-semantic-release"],
    plugins: [
      ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
      ["@semantic-release/release-notes-generator", {
        preset: "conventionalcommits",
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
            "## {{#if version}}{{version}}{{else}}{{currentTag}}{{/if}}{{#if date}} ({{date}}){{/if}}\n\n" +
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
          message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }
      ],
      // Temporarily disabled for testing
      // [
      //   "@semantic-release/github",
      //   {
      //     successComment: false,
      //     failComment: false,
      //     releasedLabels: false
      //   }
      // ]
    ]
  };