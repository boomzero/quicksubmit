# quickSubmit
<img width="674" alt="image" src="https://github.com/boomzero/quicksubmit/assets/85378277/8aaa4e99-60fc-4200-be19-f66b09044102">



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
  -c, --cid <number>  contest to submit to (default: "-1")
  -c --config         path to config file
  -O, --O2 <boolean>  whether to enable O2 (default: true)
  -h, --help          display help for command
➜  quickSubmit git:(main) 
```
