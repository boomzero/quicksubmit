import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import MD5 from 'crypto-js/md5';
import os from 'os';
const program = new Command();

program
    .argument('[file]', 'file to submit', 'main.cpp')
    .requiredOption('-p, --pid <number>', 'problem id to submit to')
    .option('-c, --cid <number>', 'contest to submit to', '-1')
    .option('-c --config', 'path to config file', os.homedir() + '/quicksubmit.json')
    .option('-O, --O2 <boolean>', 'whether to enable O2', true)
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
            console.log(`using PHPSESSID: ${PHPSESSID}`);
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
            let CPID: string = "";
            if (options.cid != '-1') {
                const contestReq = await fetch("https://www.xmoj.tech/contest.php?cid=" + options.cid, {
                    "credentials": "include",
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "same-origin",
                        "Cookie": "PHPSESSID=" + PHPSESSID
                    },
                    "referrer": "https://www.xmoj.tech/contest.php",
                    "method": "GET",
                    "mode": "cors"
                });
                const res=await contestReq.text();
                if (contestReq.status != 200||res.indexOf("比赛尚未开始或私有，不能查看题目。") != -1) {
                    console.error(`Failed to get contest page!`);
                    process.exit(1);
                }
                console.log();
                const dom = new JSDOM(res);
                let contestProblems = [];
                let rows = (dom.window.document.querySelector("#problemset > tbody") as HTMLTableSectionElement).rows;
                for (let i = 0; i < rows.length; i++) {
                    contestProblems.push(rows[i].children[1].textContent.substring(2,6).replaceAll("\t",""));
                }
                console.log(contestProblems);
                if (contestProblems.indexOf(options.pid) == -1) {
                    console.error(`Problem ${options.pid} not found in contest ${options.cid}!`);
                    process.exit(1);
                }
                CPID = contestProblems.indexOf(options.pid).toString();
                console.log(`Found problem ${options.pid} in contest ${options.cid}! ID: ${CPID}`);
            }
            console.log(`Submitting ${file} to problem ${options.pid} `, (options.cid != '-1' ? `in contest ` + options.cid : ``), `...`);
            let subReq: Response;
            if (options.cid == '-1') {
                subReq = await fetch("https://www.xmoj.tech/submit.php", {
                    "credentials": "include",
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                        "Cookie": "PHPSESSID=" + PHPSESSID
                    },
                    "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
                    "method": "POST",
                    "body": "id=" + options.pid + "&" +
                        "language=1&" +
                        "source=" + encodeURIComponent(await Bun.file(file).text()) +
                        (options.O2 == false ? "&enable_O2=on" : "")
                });
            } else {
                subReq = await fetch("https://www.xmoj.tech/submit.php", {
                    "credentials": "include",
                    "headers": {
                        "content-type": "application/x-www-form-urlencoded",
                        "Cookie": "PHPSESSID=" + PHPSESSID
                    },
                    "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
                    "method": "POST",
                    "body": "cid=" + options.cid + "&pid=" + CPID + "&" +
                        "language=1&" +
                        "source=" + encodeURIComponent(await Bun.file(file).text()) +
                        (options.O2 == false ? "&enable_O2=on" : "")
                });
            }
            const res = await subReq.text();
            console.log(res);
            if (subReq.status != 200) {
                console.error(`Failed to submit ${file} to problem ${options.pid}`, (options.cid != '-1' ? `in contest ` + options.cid : ``), `! Status code: ${subReq.status} ${subReq.statusText}`);
                process.exit(1);
            }
            if (res.indexOf("题目不可用!!") != -1) {
                console.error(`You don't have permission to submit to problem ${options.pid}`, (options.cid != '-1' ? `in contest ` + options.cid : ``), `!`);
                process.exit(1);
            }
            console.log(`Submitted ${file} to problem ${options.pid}!`);
            const logoutReq = await fetch("https://www.xmoj.tech/logout.php", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Cookie": "PHPSESSID=" + PHPSESSID
                },
                "referrer": "https://www.xmoj.tech/status.php",
                "method": "GET",
                "mode": "cors"
            });
            if (logoutReq.status != 200) {
                console.error(`Failed to log out! Status code: ${logoutReq.status} ${logoutReq.statusText}`);
                process.exit(1);
            }
            console.log(`Logged out.`);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
    );

program.parse();
