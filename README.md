# quicksubmit

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

# usage
```
Usage: index [options] [file]

Submit code to XMOJ.

Arguments:
  file                file to submit (default: "main.cpp")

Options:
  -p, --pid <number>  problem id
  -c --config         path to config file
  -O, --O2 <bool>     whether to enable O2 (default: true)
  -h, --help          display help for command
```
