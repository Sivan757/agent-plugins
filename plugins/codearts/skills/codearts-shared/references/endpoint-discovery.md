# 找到 API 终端节点

> 本文件由 `skills/codearts-shared/SKILL.md` 引用：需要确定或排查服务端点时读它，
> 日常使用不必读。


CodeArts 的终端节点分两种情况：

- **公网华为云**：由 region 派生，即 `<服务>-ext.<region>.myhuaweicloud.com`
  （如 `cloudbuild-ext.cn-north-4.myhuaweicloud.com`）。
- **私有云（华为云Stack）**：官方文档只写「向管理员获取」，而且**每个服务一个域名**，
  命名还不统一（实测见过 `cloudpipeline-ext.<region>.<domain>` 与 `cloudbuild.<region>.<domain>` 并存）。

私有云用 discovery 一条命令定位全部服务：

```bash
codearts endpoint discover --region <region0_id> --domain <部署域名>
codearts endpoint discover --region <region0_id> --domain <部署域名> --write
```

它会按服务逐个探测候选域名：返回 `401 + APIGW.0301`（缺 X-Auth-Token）说明该域名承载了这个服务，
`APIGW.0101`（API 未发布）说明不是；找到的结果可用 `--write` 写入配置。
个别服务在这个部署里可能没有开放（探测不到），这时再请管理员确认。

手工核对单个候选地址用 `codearts probe <url>`；要针对某个服务判定，就带上 `--service`，
它会探该服务的真实路径（不带时只探一条通用路径，工作正常的域名也可能被报 0101）：

```bash
codearts probe https://codeartscheck.<region>.<domain> --service check
```

| 探测结果 | 含义 |
|----------|------|
| 401 / 403（含 `APIGW.0301`） | 就是该服务的网关，只差凭证 |
| `APIGW.0101` | 打到了华为云 API 网关，但**这条探测路径**没发布。`probe` 每个服务只探一条路径，工作正常的域名也可能返回它 —— 不要据此判定域名错误，端点决策用 `codearts endpoint discover` |
| 跳 SSO 的脚本页 | 控制台/单页应用，REST 接口在另一个域名 |
| 404 / 连接失败 | 不是 CodeArts / 地址或网络不对 |

端点管理命令：

```bash
codearts endpoint list                      # 每个服务实际使用哪个地址
codearts endpoint set pipeline https://...  # 手工固定某个服务
codearts endpoint clear [service]           # 取消覆盖
```

