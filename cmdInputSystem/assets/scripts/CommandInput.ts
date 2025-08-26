// Cocos 3.8.6 搓招输入系统 (简化版，不考虑斜向)
// 保存到 assets/scripts/CommandInput.ts

import { _decorator, Component, EventKeyboard, KeyCode, EventTarget, Input, input } from 'cc';
const { ccclass } = _decorator;

// 定义输入按键类型
// 可以根据需要扩展，比如加上“投技键”、“必杀键”等
export type InputKey = "LEFT" | "RIGHT" | "UP" | "DOWN" | "A" | "B" | "C";

// 单次输入事件的数据结构
interface InputEvent {
    key: InputKey;   // 按下的键
    time: number;   // 输入的时间戳（ms）
}

// 技能指令的配置结构
interface Command {
    name: string;            // 技能名字（例如 fireball、uppercut）
    sequence: InputKey[];    // 需要按下的按键序列
    maxStepInterval: number; // 序列中两步之间允许的最大间隔（毫秒）
    cooldown: number;        // 冷却时间（避免重复触发）
    priority: number;        // 优先级（多个指令匹配时取高的）
}

@ccclass("CommandInput")
export class CommandInput extends Component {
    // 输入缓存队列，保存最近输入的按键
    private buffer: InputEvent[] = [];
    private readonly MAX_BUFFER = 10; // 最大缓存数量

    // 指令列表
    private commands: Command[] = [];

    // 记录每个技能上次触发的时间，用来做冷却判定
    private lastTriggerTime: Record<string, number> = {};

    // 事件派发器，用于通知外部（例如 PlayerCombat 脚本）
    public eventTarget: EventTarget = new EventTarget();

    onLoad() {
        // 监听键盘输入事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        // 初始化默认的技能指令
        this.initDefaultCommands();
    }

    onDestroy() {
        // 移除事件监听
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    // 键盘按下事件处理
    private onKeyDown(event: EventKeyboard) {
        let key: InputKey | null = null;
        switch (event.keyCode) {
            // 方向键（或 WASD）
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A: key = "LEFT"; break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D: key = "RIGHT"; break;
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W: key = "UP"; break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S: key = "DOWN"; break;

            // 攻击键（J、K、L）
            case KeyCode.KEY_J: key = "A"; break;
            case KeyCode.KEY_K: key = "B"; break;
            case KeyCode.KEY_L: key = "C"; break;
        }

        if (!key) return; // 不处理其它按键

        // 将输入存入缓存
        this.pushInput(key);
        // 检查是否有指令匹配
        this.checkCommands();
    }

    // 把输入放入缓存队列
    private pushInput(key: InputKey) {
        const now = performance.now();
        this.buffer.push({ key, time: now });
        if (this.buffer.length > this.MAX_BUFFER) this.buffer.shift(); // 超出则移除最早的
    }

    // 初始化默认的技能指令（可自定义）
    private initDefaultCommands() {
        this.commands = [
            // 闪电链：↓ → + A
            { name: "lightCharge", sequence: ["DOWN", "RIGHT", "A"], maxStepInterval: 300, cooldown: 200, priority: 1 },

            // 闪电球：↓ → ↓ → + A
            { name: "lightBall", sequence: ["DOWN", "RIGHT", "DOWN", "RIGHT", "A"], maxStepInterval: 300, cooldown: 200, priority: 2 },

            // 前冲：→ → + A
            { name: "dash", sequence: ["RIGHT", "RIGHT", "A"], maxStepInterval: 200, cooldown: 150, priority: 0 },
        ];
    }

    // 检查输入缓存是否匹配任何指令
    private checkCommands() {
        let matched: Command | null = null;

        for (const cmd of this.commands) {
            if (this.matchSequence(cmd)) {
                // 如果有多个匹配，取优先级最高的
                if (!matched || cmd.priority > matched.priority) {
                    matched = cmd;
                    console.log("匹配到指令:", cmd.name);
                }
            }
        }

        if (matched) {
            this.triggerCommand(matched);
        }
    }

    // 判断缓存中的输入是否符合某个指令的序列
    private matchSequence(cmd: Command): boolean {
        const now = performance.now();

        // 判断冷却
        if (this.lastTriggerTime[cmd.name] && now - this.lastTriggerTime[cmd.name] < cmd.cooldown) {
            return false;
        }

        let idx = cmd.sequence.length - 1; // 从后往前匹配
        let lastTime = -1;
        console.log("buffer:", this.buffer)
        for (let i = this.buffer.length - 1; i >= 0 && idx >= 0; i--) {
            const input = this.buffer[i];

            if (input.key === cmd.sequence[idx]) {
                // 判断时间间隔是否超限
                if (lastTime > 0 && (lastTime - input.time) > cmd.maxStepInterval) {
                    return false;
                }

                lastTime = input.time;
                idx--; // 匹配下一个
            } else break; // 当前按键不匹配，停止检查
        }

        // 如果序列全部匹配成功，idx 会小于 0
        return idx < 0;
    }

    // 触发指令：记录冷却 & 派发事件
    private triggerCommand(cmd: Command) {
        this.lastTriggerTime[cmd.name] = performance.now();
        this.eventTarget.emit('command', cmd.name);
        console.log("触发技能:", cmd.name);
    }
}

/* ================= 使用示例 =================
在另一个脚本里监听触发的技能：

import { _decorator, Component } from 'cc';
import { CommandInput } from './CommandInput';
const { ccclass } = _decorator;

@ccclass("PlayerCombat")
export class PlayerCombat extends Component {
    private input: CommandInput = null!;

    onLoad() {
        this.input = this.getComponent(CommandInput)!;
        this.input.eventTarget.on('command', this.onCommand, this);
    }

    // 技能触发回调
    onCommand(name: string) {
        if (name === "fireball") {
            console.log("释放波动拳!");
        }
        else if (name === "uppercut") {
            console.log("升龙拳!");
        }
        else if (name === "dash") {
            console.log("前冲!");
        }
    }
}
*/
