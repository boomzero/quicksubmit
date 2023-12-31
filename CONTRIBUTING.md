# Contributing Guide

Welcome! We are glad that you want to contribute to our project! 💖

As you get started, you are in the best position to give us feedback on areas of
our project that we need help with including:

- Problems found during setting up a new developer environment
- Gaps in our Quickstart Guide or documentation
- Bugs in our automation scripts

If anything doesn't make sense, or doesn't work when you run it, please open a
bug report and let us know!

## Ways to Contribute

We welcome many different types of contributions including:

- New features
- Builds, CI/CD
- Bug fixes
- Documentation
- Issue Triage
- Answering questions on Slack/Mailing List
- Web design
- Communications / Social Media / Blog Posts
- Release management

## Find an Issue

[Instructions](https://contribute.cncf.io/maintainers/github/templates/required/contributing/#find-an-issue)

We have good first issues for new contributors and help wanted issues suitable
for any contributor. `good first issue` has extra information to help you make
your first contribution. `help wanted` are issues suitable for someone who isn't
a core maintainer and is good to move onto after your first pull request.

Sometimes there won’t be any issues with these labels. That’s ok! There is
likely still something for you to work on. If you want to contribute but you
don’t know where to start or can't find a suitable issue, you can file a feature
request yourself! Once you see an issue that you'd like to work on, please post
a comment saying that you want to work on it. Something like "I want to work on
this" is fine.

## Sign Your Commits

### DCO

Licensing is important to open source projects. It provides some assurances that
the software will continue to be available based under the terms that the
author(s) desired. We require that contributors sign off on commits submitted to
our project's repositories. The
[Developer Certificate of Origin (DCO)](https://probot.github.io/apps/dco/) is a
way to certify that you wrote and have the right to contribute the code you are
submitting to the project.

You sign-off by adding the following to your commit messages. Your sign-off must
match the git user and email associated with the commit.

    This is my commit message

    Signed-off-by: Your Name <your.name@example.com>

Git has a `-s` command line option to do this automatically:

    git commit -s -m 'This is my commit message'

If you forgot to do this and have not yet pushed your changes to the remote
repository, you can amend your commit with the sign-off by running

    git commit --amend -s

## Submit a Pull Request

Please submit a pull request with a clear list of what you've done. We can
always use more test coverage. Please follow our coding conventions (below) and
make sure all of your commits are atomic (one feature per commit). Please submit
pull requests to the `next` branch.

## Coding Conventions

Your code should pass `deno fmt` and `deno lint`. You can run them using:

```bash
deno fmt
deno lint
```
