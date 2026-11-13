# 机场原生规则 · 自动节点池增强（Nodes Only）

仅适合 **Mihomo/Clash Verge/CordC Windows** 等能运行 `main(config)` 配置脚本的客户端。不会更改机场配置的分流规则、默认节点策略、DNS 或其他设置。

- [CordC-NodesOnly.js](./CordC-NodesOnly.js)：用于 CordC（`const main=(config)=>...`）。
- [Clash-Verge-NodesOnly.js](./Clash-Verge-NodesOnly.js)：用于 Clash Verge Rev 全局扩展脚本（`function main(config)`）。
- 脚本会附加 `AirportAuto-HK-AUTO`、`AirportAuto-JP-AUTO`、`AirportAuto-US-AUTO`、`AirportAuto-SG-AUTO`、`AirportAuto-TW-AUTO` 等地区节点组。
- 对名称标注的 0 < 倍率 ≤ 1x 节点进行低延迟优选；同地区低倍率全部不可用时采用本地区备用节点；不会跨地区自动回退。
- 原始规则中的 `MATCH`、`RULE-SET`、`GEOSITE` 等完全保留，**新增的地区节点池是可选的，并不会自动接管机场规则**。若要某一机场原有服务改用该节点池，需要由使用者自行在机场的分流策略组选择。
- 脚本按节点名称识别地区及倍率。实际出口地区和节点可用性仍须验证。某些纯 proxy-provider 配置没有直接节点列表时，无法严格保证低倍率优先。

**CordC：** 设置 → 高级 → 脚本 → 通过 URL 导入：
`https://cdn.jsdelivr.net/gh/Gavin-L/loon-config@main/windows/CordC-NodesOnly.js`

**Clash Verge：** 订阅 → 全局扩展脚本，复制 `Clash-Verge-NodesOnly.js` 的 Raw 内容。保留旧配置作为备份。

使用该脚本前，**停用或替换完整版 GitHub 自动分流脚本**，避免两种脚本互相干扰。文件里没有机场订阅 Token 或私人节点配置。

这是 Windows 的配置覆写脚本，不是 iPhone Loon 配置。iPhone Loon 若要沿用机场自带规则，需要机场另行提供兼容 Loon 的完整配置或规则集，不能把 Clash/Mihomo 规则直接当作 Loon 规则。
