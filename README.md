# quickSubmit
Submit Code to XMOJ.

<img width="674" alt="image" src="https://github.com/boomzero/quicksubmit/assets/85378277/8aaa4e99-60fc-4200-be19-f66b09044102">

## quickStart
You can get binaries from the [release page](https://github.com/boomzero/quicksubmit/releases).
You need to put `quicksubmit.json` in your home directory.
It should look something like this:
```json
{
    "username": "<your username>",
    "password": "<your password>"
}
```

## building
```bash
npm install
npm build
```
The binaries will be in the `bin` folder.
You can also run it using `npm start`.
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
