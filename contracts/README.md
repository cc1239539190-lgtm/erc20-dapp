# ERC-20 Mint 

## 项目定位与边界
- 这是 ERC20 起点项目：用 `Foundry + Next.js` 跑通“部署合约 -> 前端写链 -> 链上读数”最小闭环。
- 合约边界非常明确：`mint` 和 `burn` 都是 `onlyOwner`，普通用户只做读取。

## 角色与核心对象
| 角色 | 职责 | 关键对象 |
| --- | --- | --- |
| Owner（部署者） | 部署 `LZWCoin`，执行 `mint/burn` | `OWNER_PRIVATE_KEY`、`OWNER_ADDRESS` |
| User（前端连接钱包） | 读取余额与总供应量，观察状态变化 | 钱包地址、`balanceOf` |
| 合约 `LZWCoin` | 维护 ERC20 状态与权限 | `Mint/Burn` 事件、`totalSupply` |


## 业务主流程
1. 用户打开页面并连接钱包。
2. 前端读取合约地址（`frontend/.env.local`）和 ABI。
3. Owner 点击铸造按钮，前端发起 `mint(uint256)` 交易。
4. 合约校验 `onlyOwner`，通过后 `_mint(msg.sender, amount)`。
5. 链上状态变化：`totalSupply` 增加，Owner 余额增加，触发 `Mint` 事件。
6. 前端等待回执并重新读取 `balanceOf` / `totalSupply`。
7. 页面回显新余额，完成“用户动作 -> 链上变化 -> 前端回显”闭环。

## 合约接口与状态
| 接口/事件 | 调用方 | 输入 | 状态变化 | 失败条件 | 前端触发入口 |
| --- | --- | --- | --- | --- | --- |
| `mint(uint256)` | Owner | `amount` | 增加 `totalSupply` 与 Owner 余额 | 非 Owner 调用 | `components/erc20mint.js` |
| `burn(uint256)` | Owner | `amount` | 减少 `totalSupply` 与 Owner 余额 | 非 Owner / 余额不足 | 脚本或控制台 |
| `balanceOf(address)` | 任意读 | `account` | 无 | 无 | 页面读链逻辑 |
| `Mint(uint256)` | 合约发出 | `amount` | 事件日志 | 无 | 交易后可用于索引 |
| `Burn(uint256)` | 合约发出 | `amount` | 事件日志 | 无 | 交易后可用于索引 |


## Demo 展示
![铸造页面（首页）](./docs/1.png)(./docs/2.png)(./docs/3.png)
![合约实现（LuLuCoin.sol）](./docs/2.png)
![合约交互核心（erc20mint.js）](./docs-assets/web3-mint-code.png)

## 感谢
-  `claude` `deepseek` `claude code` `lllu_23`
