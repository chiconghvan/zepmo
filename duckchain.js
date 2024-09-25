const { HttpsProxyAgent } = require("https-proxy-agent");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const colors = require("colors");
const readline = require("readline");

const configPath = path.join(process.cwd(), "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

class DuckChain {
    constructor() {
        this.headers = {
          Accept: "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Content-Type": "application/json",
          Origin: "https://tgdapp.duckchain.io",
          Referer: "https://tgdapp.duckchain.io/",
          "Sec-Ch-Ua":
            '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?1",
          "Sec-Ch-Ua-Platform": '"Android"',
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site"
        };
        this.line = "~".repeat(42).white;
      }

      getUserAgent(index) {
        const userAgentFilePath = path.join(__dirname, 'useragent.txt');
        const userAgents = fs.readFileSync(userAgentFilePath, 'utf-8').split('\n').filter(Boolean);
        const validUserAgents = userAgents.map(ua => ua.replace(/[^\x20-\x7E]/g, ''));
        return validUserAgents[index];
      }
    
      async waitWithCountdown(seconds, index) {
        for (let i = seconds; i >= 0; i--) {
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(
            `===== Đã hoàn thành tất cả tài khoản, chờ ${i} giây để tiếp tục =====`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        console.log("");
      }
    
      async checkProxyIP(proxy) {
        try {
          const proxyAgent = new HttpsProxyAgent(proxy);
          const response = await axios.get("https://api.myip.com/", {
            httpsAgent: proxyAgent,
          });
          if (response.status === 200) {
            return response.data.ip;
          } else {
            this.log(`❌ Lỗi khi kiểm tra IP của proxy: ${error.message}`.red);
          }
        } catch (error) {
          this.log(`❌ Lỗi khi kiểm tra IP của proxy: ${error.message}`.red);
        }
      }
    
      log(msg, proxyIP) {
        const time = new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        console.log(`[${time}] > ${proxyIP} > ${msg}`.cyan);
      }
    
      async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    
      async title() {
        console.clear();
        console.log(`
                        ███████╗███████╗██████╗ ███╗   ███╗ ██████╗ 
                        ╚══███╔╝██╔════╝██╔══██╗████╗ ████║██╔═══██╗
                          ███╔╝ █████╗  ██████╔╝██╔████╔██║██║   ██║
                         ███╔╝  ██╔══╝  ██╔═══╝ ██║╚██╔╝██║██║   ██║
                        ███████╗███████╗██║     ██║ ╚═╝ ██║╚██████╔╝
                        ╚══════╝╚══════╝╚═╝     ╚═╝     ╚═╝ ╚═════╝ 
                        `);
        console.log(
          colors.yellow(
            "Tool này được làm bởi Zepmo. Nếu bạn thấy hay thì hãy ủng hộ mình 1 subscribe nhé!"
          )
        );
        console.log(
          colors.blue(
            "Liên hệ Telegram: https://web.telegram.org/k/#@zepmoairdrop \n"
          )
        );
      }

      async getInfo(data, proxy, index, proxyIP) {
        const url = "https://preapi.duckchain.io/user/info"
        const header = {
            ...this.headers,
            Authorization: `tma ${data}`,
            "User-Agent": this.getUserAgent(index)
        }
        try {
            const res = await axios.get(url, {
                headers: header,
                httpsAgent: new HttpsProxyAgent(proxy)
            })
            if (res?.data?.code === 200) {
                this.log(`[Account ${index}] Số dư : ${res.data.data.decibels} QUACK | ${res.data.data.quackTimes} lần chơi!`.blue, proxyIP);
                return res.data.data;
              } else {
                this.log(`[Account ${index}] lỗi khi lấy thông tin: ${res.data.message}`.red, proxyIP);
            }
        } catch (error) {
            this.log(`[Account ${index}] lỗi khi lấy thông tin: ${error.message}`.red, proxyIP);
        }
    }

    async executeQuack(data, proxy, index, proxyIP) {
        const url = "https://preapi.duckchain.io/quack/execute"
        const header = {
            ...this.headers,
            Authorization: `tma ${data}`,
            "User-Agent": this.getUserAgent(index)
        }
        try {
            const res = await axios.get(url, {
                headers: header,
                httpsAgent: new HttpsProxyAgent(proxy)
            })
            if (res?.data?.code === 200) {
                const quackRecords = res?.data?.data?.quackRecords;
                this.log(`[Account ${index}] Quack thành công | Kết quả ${quackRecords[quackRecords.length-1]} | Số dư : ${res?.data?.data?.decibel}!`.green, proxyIP);
            } else {
                this.log(`[Account ${index}] lỗi khi quack: ${res.data.message}`.red, proxyIP);
            }
        } catch (error) {
            this.log(`[Account ${index}] lỗi khi quack: ${error.message}`.red, proxyIP);
        }
    }

    async getInfoTask (data, proxy, index, proxyIP) {
      const url = `https://preapi.duckchain.io/task/task_info`
      const header = {
          ...this.headers,
          Authorization: `tma ${data}`,
          "User-Agent": this.getUserAgent(index)
      }
      try {
          const res = await axios.get(url, {
              headers: header,
              httpsAgent: new HttpsProxyAgent(proxy)
          })
          if (res?.data?.code === 200) {
              return res?.data?.data;
          } else {
              this.log(`[Account ${index}] lỗi khi lấy thông tin task: ${res.data.message}`.red, proxyIP);
          }
      } catch (error) {
          this.log(`[Account ${index}] lỗi khi lấy thông tin task: ${error.message}`.red, proxyIP);
      }
    }

    async getTask(data, proxy, index, proxyIP) {
      const url = `https://preapi.duckchain.io/task/task_list`
      const header = {
          ...this.headers,
          Authorization: `tma ${data}`,
          "User-Agent": this.getUserAgent(index)
      }
      try {
          const res = await axios.get(url, {
              headers: header,
              httpsAgent: new HttpsProxyAgent(proxy)
          })
          if (res?.data?.code === 200) {
              return res?.data?.data;
          } else {
              this.log(`[Account ${index}] lỗi khi lấy task: ${res.data.message}`.red, proxyIP);
          }
      } catch (error) {
          this.log(`[Account ${index}] lỗi khi lấy task: ${error.message}`.red, proxyIP);
      }
    }

    async doTask (data, proxy, index, task, jobId, proxyIP) {
      const url = `https://preapi.duckchain.io/task/${jobId}?taskId=${task?.taskId}`;
      const header = {
          ...this.headers,
          Authorization: `tma ${data}`,
          "User-Agent": this.getUserAgent(index)
      }
      try {
          const res = await axios.get(url, {
              headers: header,
              httpsAgent: new HttpsProxyAgent(proxy)
          })
          if (res?.data?.code === 200) {
              this.log(`[Account ${index}] Hoàn thành task ${task?.content}!`.green, proxyIP);
          } else {
              this.log(`[Account ${index}] lỗi khi hoàn thành task ${task?.content}: Vui lòng vào app để thực hiện!`.yellow, proxyIP);
          }
      } catch (error) {
          this.log(`[Account ${index}] lỗi khi hoàn thành task ${task?.content}: ${error.message}`.red, proxyIP);
      }
    }

    async checkin(data, proxy, index, proxyIP) {
      const url = `https://preapi.duckchain.io/task/sign_in?
`
      const header = {
          ...this.headers,
          Authorization: `tma ${data}`,
          "User-Agent": this.getUserAgent(index)
      }
      try {
          const res = await axios.get(url, {
              headers: header,
              httpsAgent: new HttpsProxyAgent(proxy)
          })
          if (res?.data?.code === 200) {
              this.log(`[Account ${index}] Check-in thành công!`.green, proxyIP);
          } else {
              this.log(`[Account ${index}] Check-in thất bại!`.yellow, proxyIP);
          }
      } catch (error) {
          this.log(`[Account ${index}] Check-in thất bại: ${error.message}`.red, proxyIP);
      }
    }

    async openBox(data, proxy, index, proxyIP) {
      const url = `https://preapi.duckchain.io/box/open?openType=-1`
      const header = {
          ...this.headers,
          Authorization: `tma ${data}`,
          "User-Agent": this.getUserAgent(index)
      }
      try {
          const res = await axios.get(url, {
              headers: header,
              httpsAgent: new HttpsProxyAgent(proxy)
          })
          if (res?.data?.code === 200) {
              this.log(`[Account ${index}] Mở ${res?.data?.data?.quantity} hộp quà thành công | (+) ${res?.data?.data?.obtain}`.green, proxyIP);
          } else {
              this.log(`[Account ${index}] lỗi khi mở hộp quà: ${res.data.message}`.red, proxyIP);
          }
      } catch (error) {
          this.log(`[Account ${index}] lỗi khi mở hộp quà: ${error.message}`.red, proxyIP);
      }
    }

      async process(data, proxy, index) {
        const proxyIP = await this.checkProxyIP(proxy) || proxy.split("@")[1];
        if (config.is_do_task) {
          const taskProgress = await this.getInfoTask(data,proxy, index, proxyIP);
          const socialTaskProgress = taskProgress?.social_media;
          const taskList = await this.getTask(data,proxy, index, proxyIP);
          const socialTask = taskList?.social_media;
          let isOpenTask = true;
          if (socialTask && socialTaskProgress) {
            for (const task of socialTaskProgress) {
              if (!socialTaskProgress.includes(task?.taskId)) {
                isOpenTask = false;
                await this.doTask(data,proxy, index, task, "follow_twitter", proxyIP);
                await this.sleep(5000);
              }
            }
          }
          if (isOpenTask) {
            const taskDailyProgress = taskProgress?.daily;
            const dailyTask = taskList?.daily;
            if (dailyTask && taskDailyProgress) {
              for (const task of dailyTask) {
                if (!taskDailyProgress.includes(task?.taskId)) {
                  if (task?.taskType === "daily_check_in") {
                    await this.checkin(data,proxy, index, proxyIP);
                    await this.sleep(5000);
                  }
                  else {
                    await this.doTask(data,proxy, index, task, task?.taskType, proxyIP);
                    await this.sleep(5000);
                  }
                }
              }
            }
    
            const taskOneTimeProgress = taskProgress?.partner;
            const oneTimeTask = taskList?.oneTime;
            if (oneTimeTask && taskOneTimeProgress) {
              for (const task of oneTimeTask) {
                if (!taskOneTimeProgress.includes(task?.taskId, proxyIP)) {
                  await this.doTask(data,proxy, index, task, "partner", proxyIP);
                  await this.sleep(5000);
                }
              }
            }
    
            const partnerTaskProgress = taskProgress?.partner;
            const partnerTask = taskList?.partner;
            if (partnerTask && partnerTaskProgress) {
              for (const task of partnerTask) {
                if (!partnerTaskProgress.includes(task.taskId)) {
                  await this.doTask(data,proxy, index, task, "partner", proxyIP);
                  await this.sleep(5000);
                }
              }
            }
          }
          else {
            this.log(`[Account ${index}] Vui lòng thực hiện kết nối ví và subscribe channel để nhận thêm nhiệm vụ!`.yellow);
          }
        }
        //
        const info = await this.getInfo(data, proxy, index, proxyIP);
        if (info?.boxAmount > 0) {
          await this.openBox(data, proxy, index, proxyIP);
        }
        await this.executeQuack(data, proxy, index, proxyIP);
      }

      async main() {
        await this.title();
        const dataFile = path.join(__dirname, "data.txt");
        const data = fs
          .readFileSync(dataFile, "utf8")
          .replace(/\r/g, "")
          .split("\n")
          .filter(Boolean);
    
        const proxyFile = path.join(__dirname, "proxy.txt");
        const proxyList = fs
          .readFileSync(proxyFile, "utf8")
          .replace(/\r/g, "")
          .split("\n")
          .filter(Boolean);
    
        if (data.length <= 0) {
          this.log("No accounts added!".red);
          process.exit();
        }
    
        if (proxyList.length <= 0) {
          this.log("No proxies added!".red);
          process.exit();
        }
    
        while (true) {
          const threads = [];
          for (const [index, tgData] of data.entries()) {
            const proxy = proxyList[index % proxyList.length];
            threads.push(this.process(tgData, proxy, index + 1));
            if (threads.length >= config.threads) {
              console.log(`Running ${threads.length} threads process...`.bgYellow);
              await Promise.all(threads);
              threads.length = 0;
            }
          }
          if (threads.length > 0) {
            console.log(`Running ${threads.length} threads process...`.bgYellow);
            await Promise.all(threads);
          }
          await this.waitWithCountdown(config.wait_time);
        }
      }
}

if (require.main === module) {
    process.on("SIGINT", () => {
      process.exit();
    });
    new DuckChain().main().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }