/*
 *     quickSubmit
 *     Copyright (C) 2023-2024  boomzero
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Command } from "commander";
import { JSDOM } from "jsdom";
import MD5 from "crypto-js/md5.js";
import fs from "node:fs/promises";
import os from "node:os";
import process from "node:process";
import * as path from "node:path";

const program = new Command();

program
  .name("quickSubmit")
  .version("v1.5.1")
  .argument("[file]", "File to submit", "main.cpp")
  .option(
    "-p, --pid <number>",
    "Problem id to submit to. If --cid is set, this can also be the id of the problem in the contest. Can be automatically inferred from file path",
  )
  .option("-c, --cid <number>", "Contest to submit to", "-1")
  .option(
    "-C, --config",
    "Path to config file",
    os.homedir() + path.sep +"quicksubmit.json",
  )
  .option("-O, --O2 <boolean>", "Whether to enable O2", true)
  .description("Submit code to XMOJ.")
  .action(async (file, options) => {
    if (options.config === "quicksubmit.json") {
      console.log("Using default config file ~/quicksubmit.json...");
    }
    try {
      const configFile = options.config;
      const configData = await fs.readFile(configFile, "utf-8");
      const config = JSON.parse(configData);
      console.log(`Using config file ${options.config}...`);
      if (!config.username || !config.password) {
        console.error(
          "Please set your username and password in the config file.",
        );
        process.exit(1);
      }
      const csrfReq = await fetch("https://www.xmoj.tech/csrf.php", {
        "credentials": "include",
        "headers": {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
          "Accept": "text/html, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.5",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
        },
        "referrer": "https://www.xmoj.tech/loginpage.php",
        "method": "GET",
        "mode": "cors",
      });
      let csrf: string;
      csrf = await csrfReq.text();
      csrf = csrf.replace('<input type="hidden" name="csrf" value="', "");
      csrf = csrf.replace('" class="1">\n', "");
      console.log(`Got CSRF: ${csrf}`);
      const PHPSESSID: string = Math.random().toString(36).substring(2, 15);
      console.log(`Using PHPSESSID: ${PHPSESSID}`);
      const loginReq = await fetch("https://www.xmoj.tech/login.php", {
        "credentials": "include",
        "headers": {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Cookie": "PHPSESSID=" + PHPSESSID,
        },
        "referrer": "https://www.xmoj.tech/loginpage.php",
        "body": "user_id=zhuchenrui2&password=" +
          MD5(config.password).toString() + "&submit=&csrf=" + csrf,
        "method": "POST",
        "mode": "cors",
      });
      if (
        (await loginReq.text()).indexOf("UserName or Password Wrong!") != -1
      ) {
        console.error("Username or Password Wrong!");
        process.exit(1);
      }
      console.log(`Logged in as ${config.username}...`);
      if (!options.pid) {
        const cwd = process.cwd();
        const segments = cwd.split(path.sep);
        let pid = "";
        for (let i = segments.length - 1; i >= 0; i--) {
          if (segments[i].match(/^\d{4}$/)) {
            pid = segments[i];
            break;
          }
        }
        if (pid === "") {
          console.error("Failed to infer PID from file path!");
          process.exit(1);
        }
        console.log(`Inferred PID: ${pid}`);
        options.pid = pid;
      }
      let CPID = "", rPID: string = options.pid;
      if (options.cid != "-1") {
        const contestReq = await fetch(
          "https://www.xmoj.tech/contest.php?cid=" + options.cid,
          {
            "credentials": "include",
            "headers": {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
              "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Upgrade-Insecure-Requests": "1",
              "Sec-Fetch-Dest": "document",
              "Sec-Fetch-Mode": "navigate",
              "Sec-Fetch-Site": "same-origin",
              "Cookie": "PHPSESSID=" + PHPSESSID,
            },
            "referrer": "https://www.xmoj.tech/contest.php",
            "method": "GET",
            "mode": "cors",
          },
        );
        const res = await contestReq.text();
        if (
          contestReq.status != 200 ||
          res.indexOf("比赛尚未开始或私有，不能查看题目。") != -1
        ) {
          console.error(`Failed to get contest page!`);
          process.exit(1);
        }
        const dom = new JSDOM(res);
        const contestProblems = [];
        const rows = (dom.window.document.querySelector(
          "#problemset > tbody",
        ) as HTMLTableSectionElement).rows;
        for (let i = 0; i < rows.length; i++) {
          contestProblems.push(
            rows[i].children[1].textContent.substring(2, 6).replaceAll(
              "\t",
              "",
            ),
          );
        }
        //console.log(contestProblems);
        if (options.pid.length <= 2) {
          CPID = (options.pid - 1).toString();
          rPID = contestProblems[options.pid - 1];
          console.log(
            `Assuming PID: ${CPID} is the id of the problem in contest ${options.cid}`,
          );
        } else {
          if (contestProblems.indexOf(options.pid) == -1) {
            console.error(
              `Problem ${options.pid} not found in contest ${options.cid}!`,
            );
            process.exit(1);
          }
          CPID = contestProblems.indexOf(options.pid).toString();
          console.log(
            `Found problem ${options.pid} in contest ${options.cid}! ID: ${CPID}`,
          );
        }
      }
      console.log(
        `Submitting ${file} to problem ${options.pid}` +
          (options.cid != "-1" ? ` in contest ` + options.cid : ``) + `...`,
      );
      const fileData = await fs.readFile(file, "utf-8");
      let subReq: Response;
      if (options.cid == "-1") {
        subReq = await fetch("https://www.xmoj.tech/submit.php", {
          "credentials": "include",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": "PHPSESSID=" + PHPSESSID,
          },
          "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
          "method": "POST",
          "body": "id=" + options.pid + "&" +
            "language=1&" +
            "source=" + encodeURIComponent(fileData) +
            (options.O2 == true ? "&enable_O2=on" : ""),
        });
      } else {
        subReq = await fetch("https://www.xmoj.tech/submit.php", {
          "credentials": "include",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": "PHPSESSID=" + PHPSESSID,
          },
          "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
          "method": "POST",
          "body": "cid=" + options.cid + "&pid=" + CPID + "&" +
            "language=1&" +
            "source=" + encodeURIComponent(fileData) +
            (options.O2 == true ? "&enable_O2=on" : ""),
        });
      }
      let res = await subReq.text();
      //console.log(res);
      if (subReq.status != 200) {
        console.error(
          `Failed to submit ${file} to problem ${options.pid}`,
          options.cid != "-1" ? `in contest ` + options.cid : ``,
          `! Status code: ${subReq.status} ${subReq.statusText}`,
        );
        process.exit(1);
      }
      if (res.indexOf("题目不可用!!") != -1) {
        console.error(
          `You don't have permission to submit to problem ${options.pid}`,
          options.cid != "-1" ? `in contest ` + options.cid : ``,
          `!`,
        );
        process.exit(1);
      }
      if (res.indexOf("没有这个比赛！") != -1) {
        console.warn(
          `Contest ${options.cid} has ended, trying to submit to problem ${rPID} directly...`,
        );
        const retryReq = await fetch("https://www.xmoj.tech/submit.php", {
          "credentials": "include",
          "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "Cookie": "PHPSESSID=" + PHPSESSID,
          },
          "referrer": "https://www.xmoj.tech/submitpage.php?id=" + options.pid,
          "method": "POST",
          "body": "id=" + rPID + "&" +
            "language=1&" +
            "source=" + encodeURIComponent(fileData) +
            (options.O2 == true ? "&enable_O2=on" : ""),
        });
        res = await retryReq.text();
        //console.log(res);
        if (retryReq.status != 200) {
          console.error(
            `Failed to submit ${file} to problem ${rPID} directly! Status code: ${retryReq.status} ${retryReq.statusText}`,
          );
          process.exit(1);
        }
        if (res.indexOf("题目不可用!!") != -1) {
          console.error(
            `You don't have permission to submit to problem ${rPID}`,
            (options.cid != "-1" ? `in contest ` + options.cid : ``) + `!`,
          );
          process.exit(1);
        }
      }
      const dom = new JSDOM(res);
      if (
        dom.window.document.querySelector(
          `tr.oddrow:nth-child(1) > td:nth-child(2)`,
        ) == null
      ) {
        console.error(
          `Failed to submit ${file} to problem ${options.pid}`,
          (options.cid != "-1" ? `in contest ` + options.cid : ``) +
            `!\n(Submission happened successfully, but the submission result is not available.)`,
        );
        process.exit(1);
      }
      const rid: string = dom.window.document.querySelector(
        `tr.oddrow:nth-child(1) > td:nth-child(2)`,
      ).innerHTML;
      console.log(`Submitted ${file} to problem ${rPID}!`);
      console.log(`Submission ID: ${rid}`);
      console.log(
        `Submission URL: \u001b]8;;https://www.xmoj.tech/reinfo.php?sid=${rid}\u001b\\https://www.xmoj.tech/reinfo.php?sid=${rid}\u001b]8;;\u001b\\`,
      );
      console.log(
        `Submission Status: \u001b]8;;https://www.xmoj.tech/status.php\u001b\\https://www.xmoj.tech/status.php\u001b]8;;\u001b\\`,
      );
      const logoutReq = await fetch("https://www.xmoj.tech/logout.php", {
        "credentials": "include",
        "headers": {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1",
          "Cookie": "PHPSESSID=" + PHPSESSID,
        },
        "referrer": "https://www.xmoj.tech/status.php",
        "method": "GET",
        "mode": "cors",
      });
      if (logoutReq.status != 200) {
        console.error(
          `Failed to log out! Status code: ${logoutReq.status} ${logoutReq.statusText}`,
        );
        process.exit(1);
      }
      console.log(`Logged out.`);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
