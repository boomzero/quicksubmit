# quickSubmit

[![Deno](https://github.com/boomzero/quicksubmit/actions/workflows/deno.yml/badge.svg)](https://github.com/boomzero/quicksubmit/actions/workflows/deno.yml)
[![Publish](https://github.com/boomzero/quicksubmit/actions/workflows/publish.yml/badge.svg)](https://github.com/boomzero/quicksubmit/actions/workflows/publish.yml)

Submit Code to XMOJ.

<img width="663" alt="a neat demo" src="https://github.com/boomzero/quicksubmit/assets/85378277/0dd45497-da62-4a6b-bf1a-de7af8077f00">


## quickStart

You can get binaries from the
[release page](https://github.com/boomzero/quicksubmit/releases). You need to
put `quicksubmit.json` in your home directory. It should look something like
this:

```json
{
  "username": "<your username>",
  "password": "<your password>"
}
```

## Building

This is a [deno](https://deno.com/) project. You should have deno installed. You
can install it from
[here](https://docs.deno.com/runtime/manual/getting_started/installation). After
that, you can build it using:

```bash
deno compile -A -c tsconfig.json index.ts
```

The binaries will be called `quickSubmit(.exe)`.

## Usage

```
Usage: quicksubmit [options] [file]

Submit code to XMOJ.

Arguments:
  file                File to submit (default: "main.cpp")

Options:
  -p, --pid <number>  Problem id to submit to. If --cid is set, this can also be the id of the problem in the contest.
  -c, --cid <number>  Contest to submit to (default: "-1")
  -c --config         Path to config file
  -O, --O2 <boolean>  Whether to enable O2 (default: true)
  -h, --help          display help for command
```
