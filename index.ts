import { Command } from 'commander';
import MD5 from 'crypto-js/md5';
import os from 'os';
const program = new Command();


if (typeof Bun === "undefined") {
    console.error('Please run this program with `bun`.');
    process.exit(1);
}

program
    .argument('[file]', 'file to submit', 'main.cpp')
    .requiredOption('-p, --pid <number>', 'problem id')
    .option('-c --config', 'path to config file', os.homedir() + '/quicksubmit.json')
    .option('-O, --O2 <bool>', 'whether to enable O2', true)
    .description('Submit code to XMOJ.')
    .action(async (file, options) => {
        if (options.config === 'quicksubmit.json') {
            console.log('Using default config file ~/quicksubmit.json...');
        }
        try {
            const configFile = Bun.file(options.config);
            const config = await configFile.json();
            console.log(`Using config file ${options.config}...`);
            if (!config.username || !config.password) {
                console.error('Please set your username and password in the config file.');
                process.exit(1);
            }
            const csrfReq = await fetch("https://www.xmoj.tech/csrf.php", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
                    "Accept": "text/html, */*; q=0.01",
                    "Accept-Language": "en-US,en;q=0.5",
                    "X-Requested-With": "XMLHttpRequest",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin"
                },
                "referrer": "https://www.xmoj.tech/loginpage.php",
                "method": "GET",
                "mode": "cors"
            });
            let csrf: string;
            csrf = await csrfReq.text();
            csrf = csrf.replace("<input type=\"hidden\" name=\"csrf\" value=\"", "");
            csrf = csrf.replace("\" class=\"1\">\n", "");
            console.log(`got CSRF: ${csrf}`);
            let PHPSESSID: string = Math.random().toString(36).substring(2, 15);
            const loginReq = await fetch("https://www.xmoj.tech/login.php", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Cookie": "PHPSESSID=" + PHPSESSID
                },
                "referrer": "https://www.xmoj.tech/loginpage.php",
                "body": "user_id=zhuchenrui2&password=" + MD5(config.password).toString() + "&submit=&csrf=" + csrf,
                "method": "POST",
                "mode": "cors"
            });
            if ((await loginReq.text()).indexOf("UserName or Password Wrong!") != -1) {
                console.error("Username or Password Wrong!");
                process.exit(1);
            }
            console.log(`Logged in as ${config.username}...`);
            console.log(`Submitting ${file} to problem ${options.pid}...`);
            const subReq = await fetch("https://www.xmoj.tech/submit.php", {
                "credentials": "include",
                "headers": {
                    "content-type": "application/x-www-form-urlencoded",
                    "Cookie": "PHPSESSID=" + PHPSESSID
                },
                "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
                "method": "POST",
                "body": "id=" + options.pid + "&" +
                    "language=1&" +
                    "source=" + encodeURIComponent(await Bun.file(file).text()) + "&" +
                    "enable_O2=" + (options.O2 ? "on" : "off")
            });
            if(subReq.status != 200) {
                console.error(`Failed to submit ${file} to problem ${options.pid}! Status code: ${subReq.status}`);
                process.exit(1);
            }
            const res = await subReq.text();
            if (res.indexOf("题目不可用!!")!= -1) {
                console.error(`You don't have permission to submit to problem ${options.pid}!`);
                process.exit(1);
            }
            console.log(`Submitted ${file} to problem ${options.pid}!`);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
    );

program.parse();
