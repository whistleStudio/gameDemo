// Cocos 3.8.6 搓招输入系统 (简化版，不考虑斜向)
// 保存到 assets/scripts/CommandInput.ts
import {
  _decorator,
  Component,
  EventKeyboard,
  KeyCode,
  EventTarget,
  Input,
  input,
  animation,
} from "cc";
const { ccclass, property } = _decorator;

// 绝对输入键（实际输入）
export type InputKey = "LEFT" | "RIGHT" | "UP" | "DOWN" | "A" | "B" | "C";

export function isInputKey(key: any): key is InputKey {
  // 触摸按钮自定义property的类型守卫
  return ["LEFT", "RIGHT", "UP", "DOWN", "A", "B", "C"].indexOf(key) >= 0;
}

// 相对键 （出招序列可用的键）
export type CommandKey = "FORWARD" | "BACKWARD" | InputKey;



// 单次输入事件的数据结构
interface InputEvent {
  key: InputKey; // 按下的键
  time: number; // 输入的时间戳（ms）
}

// 技能指令的配置结构
export interface Command {
  name: string; // 技能名字（例如 fireball、uppercut）
  sequence: CommandKey[]; // 需要按下的按键序列, 允许forward backward
  maxStepInterval: number; // 序列中两步之间允许的最大间隔（毫秒）
  cooldown: number; // 冷却时间（避免重复触发）
  priority: number; // 优先级（多个指令匹配时取高的）
}

@ccclass("CommandInput")
export class CommandInput extends Component {
  // 调试回调: 用于刷新实时输入匹配技能状态
  debugHandler: Function | null = null;

  // 朝向
  facingRight: boolean = true;

  // 变身形态
  formIdx: number = 0; // 0 雷 / 1 火

  // 输入缓存队列，保存最近输入的按键
  private buffer: InputEvent[] = [];
  private readonly MAX_BUFFER = 10; // 最大缓存数量

  // 指令列表
  commands: Command[][] = [];

  // 记录每个技能上次触发的时间，用来做冷却判定
  private lastTriggerTime: Record<string, number> = {};

  // 事件派发器，用于通知外部（例如 PlayerCombat 脚本）
  public eventTarget: EventTarget = new EventTarget();

  onLoad() {
    // 监听键盘输入事件
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    // 初始化默认的技能指令
    this.initDefaultCommands();
    // 监听形态变化事件
    this.node.on(
      "formChanged",
      (formIdx: number) => {
        this.formIdx = formIdx;
      },
      this
    );
  }

  onDestroy() {
    // 移除事件监听
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  // 键盘按下/虚拟手柄触摸事件处理
  onKeyDown(event: EventKeyboard | null, keyTouch: any = null) {
    let key: InputKey | null = null;
    if (event)
      // 适配键盘
      switch (event.keyCode) {
        // 方向键（或 WASD）
        case KeyCode.ARROW_LEFT:
        case KeyCode.KEY_A:
          key = "LEFT";
          break;
        case KeyCode.ARROW_RIGHT:
        case KeyCode.KEY_D:
          key = "RIGHT";
          break;
        case KeyCode.ARROW_UP:
        case KeyCode.KEY_W:
          key = "UP";
          break;
        case KeyCode.ARROW_DOWN:
        case KeyCode.KEY_S:
          key = "DOWN";
          break;

        // 攻击键（J、K、L）
        case KeyCode.KEY_J:
          key = "A";
          break;
        case KeyCode.KEY_K:
          key = "B";
          break;
        case KeyCode.KEY_L:
          key = "C";
          break;
      }
    else if (isInputKey(keyTouch)) {
      // 触摸按钮传入的按键
      key = keyTouch;
    }

    if (!key) return; // 不处理其它按键

    // 将输入存入缓存
    this.pushInput(key);

    // 检查是否有指令匹配
    this.checkCommands();

    // 回调
    this.debugHandler && this.debugHandler(key);
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
      [
        // 闪电链：↓ → + A
        {
          name: "elementalWhip",
          sequence: ["DOWN", "FORWARD", "A"],
          maxStepInterval: 300,
          cooldown: 200,
          priority: 1,
        },
        // 闪电球：↓ → ↓ → + A
        {
          name: "lightBall",
          sequence: ["DOWN", "FORWARD", "DOWN", "FORWARD", "A"],
          maxStepInterval: 300,
          cooldown: 200,
          priority: 2,
        },
      ],
      [
        // 火焰喷射：↓ → + A
        {
          name: "elementalWhip",
          sequence: ["DOWN", "FORWARD", "A"],
          maxStepInterval: 300,
          cooldown: 200,
          priority: 1,
        },
        // 火焰球：→ → + B
        {
          name: "fireBall",
          sequence: ["FORWARD", "FORWARD", "B"],
          maxStepInterval: 300,
          cooldown: 150,
          priority: 2,
        },
      ],
    ];
  }

  // 检查输入缓存是否匹配任何指令
  private checkCommands() {
    let matched: Command | null = null;

    for (const cmd of this.commands[this.formIdx]) {
      if (this.matchSequence(cmd)) {
        // 如果有多个匹配，取优先级最高的
        if (!matched || cmd.priority > matched.priority) {
          matched = cmd;
          // console.log("匹配到指令:", cmd.name);
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
    const buffer = [...this.buffer]; // 复制一份，防止过程中被修改, 实际手速基本不可能有这么快
    // 判断冷却
    if (
      this.lastTriggerTime[cmd.name] &&
      now - this.lastTriggerTime[cmd.name] < cmd.cooldown
    ) {
      return false;
    }

    let idx = cmd.sequence.length - 1; // 从后往前匹配
    let lastTime = -1;
    for (let i = buffer.length - 1; i >= 0 && idx >= 0; i--) {
      const input = buffer[i];
      const expectInputKey = this.resolveCommandKey(cmd.sequence[idx]);
      if (input.key === expectInputKey) {
        // 判断时间间隔是否超限
        if (lastTime > 0 && lastTime - input.time > cmd.maxStepInterval) {
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
    this.eventTarget.emit("command", cmd.name);
    console.log("触发技能:", cmd.name);
  }

  // 处理朝向
  resolveCommandKey (k: CommandKey): InputKey {
    if (k === "FORWARD") return this.facingRight ? "RIGHT" : "LEFT";
    if (k === "BACKWARD") return this.facingRight ? "LEFT" : "RIGHT";
    return k;
  }

}

