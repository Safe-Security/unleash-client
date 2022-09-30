module.exports = {
    branches: ["main"],
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        [
            "@semantic-release/changelog",
            {
                changelogFile: "docs/CHANGELOG.md",
            },
        ],
        "@semantic-release/npm",
        "@semantic-release/github",
        [
            "@semantic-release/git",
            {
                assets: ["docs/CHANGELOG.md", "package.json"],
                message:
                    "chore(release): set `package.json` to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
            },
        ],
    ],
};
