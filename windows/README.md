# Clash Verge Rev / Windows 同步策略

本目录与 iPhone 的 Loon 配置并行维护，不含机场订阅、密码或节点凭据。

## 推荐用法（适合已有 Clash Verge 机场订阅）

1. 保留 Clash Verge「订阅」页面原有的机场配置，不必导入 Loon.conf。
2. 打开「订阅」→「全局扩展脚本（Script）」，复制 [Clash-Verge-Global-Script.js](./Clash-Verge-Global-Script.js) 的全部内容并保存。
3. 让脚本生效：必要时重新启用订阅或重启代理核心。选择「规则」模式（Rule）。
4. 到「代理」页面查看 LoonWin-HK-AUTO / LoonWin-JP-AUTO / LoonWin-US-AUTO 等策略组。
5. 验证分流：ChatGPT→JP、Microsoft/Bing→HK、YouTube/GitHub/Discord→HK、Google/Spotify→US、国内→DIRECT。
6. 「规则」页面可检查命中记录。若某个地区没有节点，会用 REJECT 而非偷偷跨区。

**你可以在同一软件保留 CordCloud 和另一机场订阅。** 全局脚本在当前启用的订阅上工作，**不会把两个独立订阅自动混成一个节点池**。若需要真正合并双机场节点，需要以后单独建立 proxy-providers 汇总配置。

## 自动测速和倍率

- 当节点直接列在所选机场配置的 \`proxies\` 中时，脚本按地区识别、解析 \`0.5x / 1x / 倍率:0.5\` 这样的倍率标识，并建立低倍率自动测速池 + 同地区备用池。
- 两级检测约 300 秒一次；不跨地区回退，但同一地区不同 IP 可能自动切换。
- 节点名称中的地区只能作为初筛，实际出口地区应在代理的 IP 查询页实测。
- 若订阅仅通过动态 \`proxy-providers\` 提供节点、脚本启动时读不到节点名称，会退化为同地区自动测速池，**此模式无法严格保证低倍率优先**。建议将节点平铺到原配置，或使用专用转换规则。
- 缺少地区节点时该地区对应策略为 REJECT（阻止跨地区泄露）。

## 从 GitHub 自动更新

该脚本创建 Mihomo \`rule-providers\`，规则指向本仓库原本给 Loon 使用的 \`rules/*.list\`（\`behavior: classical\` + \`format: text\`），每 6 小时检查更新。因此 GitHub 上的**域名分流规则**能同时被 iPhone 和 Windows 使用，CDN 可能有缓存延迟。

**脚本代码本身**目前作为 Clash Verge 的本地全局脚本使用，GitHub 上更新脚本 **不会自动改动你电脑本地已粘贴的脚本**。策略组、节点筛选算法需要手动复制最新版脚本；平时只改 \`rules/*.list\` 无需重新粘贴。

## Windows 去广告注意

本脚本提供轻量的基于规则的 REJECT 拦截（\`rules/Ads-Reject.list\`）。它不是 Loon 的 HTTPS Rewrite/MITM，也不能把 Loon 的 32 个插件直接转成 Clash Verge 插件。浏览器广告可配合独立浏览器内容拦截器，Clash 只能对域名/IP 层面拦截。

## 排查

- 最新版 Clash Verge Rev 中，「全局扩展覆写配置（Merge）」只用于 YAML 设置的覆盖/合并，**不能照搬旧教程里的 \`prepend-rules\`**；请用「全局扩展脚本（Script）」。
- 如果出现保存脚本失败或代理组无节点，在软件内查看脚本错误和「运行时订阅/运行时配置」。确认机场节点名称的地区和倍率格式。
- 由客户端 GUI 接管的端口、TUN、DNS 覆写等设置应在软件界面管理，本脚本不修改它们。
- 不要把任何私人机场 URL/Token 粘贴到 GitHub。

## 微软分流重叠修复（2026-11-11）

如果在日志中见到 `s.bingparachute.com` 或 `t.bingparachute.com` 命中机场旧 `GeoSite/microsoft` 或旧 `微软服务/微軟服務`，请把本目录最新版 `Clash-Verge-Global-Script.js` 重新粘贴到 **全局扩展脚本**（一次性）。新版将原机场 Microsoft GeoSite 和旧微软组指向 `LoonWin-HK-AUTO`，保留其他机场组。原 `rules/Microsoft-HK.list` 也新增了 Bing parachute/内部域名，远程规则刷新后会加载。

操作后在日志搜索 `bingparachute` 和 `r.bing.com`，预期使用 `LoonWin-HK-AUTO`。请核对最终节点可用，旧组造成的连接超时通常会消失，但香港池自身节点失效时仍可能超时。Bing 网页显示的国家/地区也由账户、Cookie、定位等设置决定，并非代理策略直接决定。
