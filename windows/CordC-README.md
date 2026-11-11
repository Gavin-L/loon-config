# CordC 官方客户端（Windows）：GitHub 共享规则 / 自动地区选择

从已在 Clash Verge 运行的 `windows/Clash-Verge-Global-Script.js` 改为 CordC 默认的 `const main = (config) => { ... }` 入口。

## 测试前
- 保留 Clash Verge 现有稳定配置作为备用，**不要同时打开两个软件的系统代理/TUN**。
- CordC 的 `设置 → 高级 → 脚本` 是一段 JavaScript 代码的编辑器，**脚本导入按钮是否支持 URL 自动订阅、是否自动刷新**还需要 CordC 实机验证。切勿据此推断以后可完全免手动更新。
- 先保存默认空脚本或备份原配置。

## 测试步骤
1. 打开本目录的 `CordC-Override.js`，Raw 页面复制全文。
2. CordC → 设置 → 高级 → 脚本，将默认模板替换为全文并保存；确认是否还需要在当前配置/订阅中启用这个脚本。
3. 重新加载机场配置，观察是否出现 `LoonWin-HK-AUTO`, `LoonWin-JP-AUTO`, `LoonWin-US-AUTO` 等策略组。
4. 用连接/日志验证 `bing.com`、`bingparachute.com` → 香港，`chatgpt.com` → 日本，国内域名 → DIRECT。
5. 检查 `rule-providers` 是否成功下载来自 `rules/*.list` 的域名规则。规则更新约 6 小时检查一次（CDN 缓存可能延迟）。
6. 如果规则/策略组没有生成或客户端报错，恢复默认 `const main = (config) => { return config; }`，继续用 Clash Verge，不影响其订阅。

## 自动更新能力
- **分流域名规则**：跟已有的 `rules/*.list` GitHub 地址共享，脚本运行后由 Mihomo 的 rule-provider 更新。
- **脚本逻辑本身**：如果 CordC 的脚本入口只接受粘贴代码，本地副本不会自动获得 GitHub 新提交。右上角的下载按钮不一定等于 URL 订阅，需要在 App 内实际检查。
- **机场节点**：来自 CordC 官方账户，不写入公开 GitHub。若使用第二个机场，需先确认 CordC 是否能额外导入订阅。

此文件仅经过 JavaScript 静态语法和模拟配置测试，尚未在 CordC 实机验证。