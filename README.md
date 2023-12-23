# quickSubmit
<img width="682" alt="image" src="https://github.com/boomzero/quicksubmit/assets/85378277/98b76c00-1ce7-4c37-a05d-6acbcbc1d1c7">


First install bun:
```bash
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```
To compile:

```bash
 bun build index.ts --compile --outfile=quicksubmit
```
# usage
```
Usage: quicksubmit [options] [file]

Submit code to XMOJ.

Arguments:
  file                file to submit (default: "main.cpp")

Options:
  -p, --pid <number>  problem id to submit to
  -c --config         path to config file
  -O, --O2 <bool>     whether to enable O2 (default: true)
  -h, --help          display help for command
```
