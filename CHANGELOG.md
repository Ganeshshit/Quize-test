# Changelog

All notable changes to this project will be documented in this file.

## v1.0.0 - 2026-09-10

Summary
- Initial public v1.0.0 release capturing the recent set of feature work, UI redesigns, proctoring integration, bug fixes, and documentation improvements.

Highlights

Features
- feat: integrate proctoring features with socket.io and crypto-js — added HMAC signing, event logging, and realtime socket support. (https://github.com/Ganeshshit/Quize-test/commit/33838bc711e739a3a3f793171ea48d0b00e0b093)
- feat(trainer): upgrade entire trainer portal to premium enterprise UI — major trainer portal UI/UX upgrades. (https://github.com/Ganeshshit/Quize-test/commit/826e5b4d9094c466480bb7b0b1f779098fbd21a6)
- feat(trainer): complete enterprise UI upgrades for quiz child components and particles. (https://github.com/Ganeshshit/Quize-test/commit/eb23391f67c8e467225c6b6259f2ffc99c694be3)
- feat: redesign quiz attempt page with persistent sidebar and mobile overlay. (https://github.com/Ganeshshit/Quize-test/commit/2e4da8571261d54a976984b165d507e1c55360d5)
- feat: add dynamic student profile page and password change forms. (https://github.com/Ganeshshit/Quize-test/commit/81e75f81288b6282bdee5d05fca37c83220d3fae)
- feat: Implement quiz start instructions page with camera and fullscreen requirements. (https://github.com/Ganeshshit/Quize-test/commit/a2693c8a98133e32a03927db1b43976c843e1b53)

Fixes
- fix: resolve button overlap in CreateQuiz layout (Fixes #3). (https://github.com/Ganeshshit/Quize-test/commit/63444f78451463613a6cde160902619f45a028a0)
- fix: update BASE_URL to production endpoint. (https://github.com/Ganeshshit/Quize-test/commit/8ed43586fa8887331c37be33403eb4de946ea4f7)
- Fixed the login page. (https://github.com/Ganeshshit/Quize-test/commit/431de5a0e45c71ff7ae915c948d3212fcb86d454)

Chores / Maintenance
- chore: update dependencies, layouts, and routing for new trainer UI. (https://github.com/Ganeshshit/Quize-test/commit/c76d5edf236d2607560a3b56af6d2e4b399c6e69)
- refactor: remove unused SetSumCheck class and setSum file. (https://github.com/Ganeshshit/Quize-test/commit/1adda6e22f736a286e684f8ba72db6ae71530799)

Docs
- Add comprehensive README with full project analysis. (https://github.com/Ganeshshit/Quize-test/commit/02149420c2ea26bdc576387aa7d7bf73d2fba625)
- Add issue templates and other community files. (multiple commits on 2026-09-10)

Contributors
- Coderganesh (https://github.com/Ganeshshit)
- UMESH-KALE0777 (https://github.com/UMESH-KALE0777)

Notes
- Target branch: main
- Tag: v1.0.0
- Release created separately via GitHub Releases UI or the GitHub CLI (see commands below).

How to create the GitHub Release locally

Using gh (GitHub CLI):

1) Save release notes to a file (e.g. release-notes.md) or pipe inline.

Example command (run locally):

```
gh release create v1.0.0 --title "v1.0.0" --notes-file CHANGELOG.md --target main
```

Using curl (replace $GITHUB_TOKEN):

```
curl -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" \
  -d '{"tag_name":"v1.0.0","target_commitish":"main","name":"v1.0.0","body":"See CHANGELOG.md for details","draft":false,"prerelease":false}' \
  https://api.github.com/repos/Ganeshshit/Quize-test/releases
```

View more commits (fetched page):
https://github.com/Ganeshshit/Quize-test/commits?sha=main&per_page=50

---

If you want, I can now:
- create a GitHub Release for you (I can't call the Releases API from here — you can run the command above), or
- push this CHANGELOG.md into the repo (already done), or
- update the release notes, change the tag, or create a prerelease/draft.  

