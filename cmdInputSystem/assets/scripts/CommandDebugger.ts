import { _decorator, Component, RichText, Node, Color } from "cc";
import { CommandInput, InputKey, isInputKey } from "./CommandInput";
const { ccclass, property } = _decorator;


interface SkillMatchState {
  index: number;
  lastTime: number;
}

@ccclass("CommandVisualizer")
export class CommandVisualizer extends Component {
  @property(CommandInput)
  cmdInput: CommandInput | null = null;

  skillsLabel: RichText | null = null; // 展示所有技能和匹配情况

  private states: Record<string, SkillMatchState> = {};
  private lastTriggerCmd: any = null;
  private lastTriggerTime: Record<string, number> = {};
  private lastFormIdx: number = -1;
  private commands: any[] = [];

  onLoad() {
    if (!this.cmdInput) { return console.warn("CommandDebugger: 当前节点未挂 CommandInput");}
    this.skillsLabel = this.node.getComponent(RichText);
    this.lastFormIdx = this.cmdInput["formIdx"];
    this.initializeStates();

    this.cmdInput.debugHandler = this.debugHandler.bind(this); // 绑定回调
  }

  update() {
    if (!this.cmdInput || !this.skillsLabel) return;

    if (this.lastFormIdx !== this.cmdInput["formIdx"]) { // 切换形态，更改状态
      this.initializeStates();
    }

    let text = this.cmdInput["formIdx"] === 0 ? "<b>雷法技能表</b>\n" : "<b>火法技能表</b>\n";

    const now = performance.now();

    let maxIdx = 0
    for (const cmd of this.commands) {
      const state = this.states[cmd.name];
      // 冷却跳过
      // if (this.lastTriggerTime[cmd.name] && now - this.lastTriggerTime[cmd.name] < cmd.cooldown && this.lastTriggerCmd?.name === cmd.name) {
      //   continue;
      // }
      // 间隔超时重置
      if (state.index > 0 && now - state.lastTime > cmd.maxStepInterval) {
        state.index = 0;
        state.lastTime = -1;
      }
      maxIdx = Math.max(maxIdx, state.index);
      // console.log("maxIdx:", maxIdx);
      text += this.formatCommand(cmd, state.index) + "\n";
    }
    // console.log("this.lastTriggerCmd.length:", this.lastTriggerCmd?.length)
    // 决定触发, 技能表设计正确的话，同时间段，应该仅有一个最长满足输入的技能触发；这里的触发时机选在所有技能（包括同名的待触发技能）重置后，idx<=缓存的待触发技能长度
    if (this.lastTriggerCmd && this.lastTriggerCmd.sequence.length >= maxIdx) {
      console.log("xxx触发技能:", this.lastTriggerCmd.name);
      this.lastTriggerTime[this.lastTriggerCmd.name] = now;
      let text = this.cmdInput["formIdx"] === 0 ? "<b>雷法技能表</b>\n" : "<b>火法技能表</b>\n";
      for (const cmd of this.commands) {
        const state = this.states[cmd.name];
        text += this.formatCommand(cmd, state.index, true) + "\n";
      }
      this.lastTriggerCmd = null;
    }

    this.skillsLabel.string = text;
  }

  private formatCommand(
    cmd: any, stateIndex: number, isTriggered: boolean = false
  ): string {
    let result = isTriggered && this.lastTriggerCmd.name === cmd.name ? `<color=#ff0000><b>${cmd.name}:</b></color>` : `<b>${cmd.name}:</b> `;
    // 从头调整每个按键样式
    for (let seqIdx = 0; seqIdx < cmd.sequence.length; seqIdx++) {
      const key = cmd.sequence[seqIdx];
      if (isTriggered && this.lastTriggerCmd.name === cmd.name) {
        result += `<color=#ff0000>${key}</color> `; // 触发 → 红色
        console.log("红色触发技能");
      } else if (seqIdx < stateIndex) {
        result += `<color=#00ff00>${key}</color> `; // 匹配 → 绿色
      } else {
        result += `<color=#cccccc>${key}</color> `; // 未匹配 → 灰色
      }
    }

    return result.trim();
  }

  initializeStates() {
    this.lastFormIdx = this.cmdInput["formIdx"];
    this.commands = this.cmdInput["commands"][this.lastFormIdx];
    for (const cmd of this.commands) {
      this.states[cmd.name] = { index: 0, lastTime: -1 };
    }
  }

  debugHandler (key: InputKey) {
    // console.log("当前输入:", key);
    const now = performance.now();
    for (const cmd of this.commands) {
      const state = this.states[cmd.name];
      // 冷却跳过
      if (this.lastTriggerTime[cmd.name] && now - this.lastTriggerTime[cmd.name] < cmd.cooldown) {
        continue;
      }

      const seq = cmd.sequence;
      const expected = seq[state.index];

      if (isInputKey(key) && key === expected) {
        state.index++;
        state.lastTime = now;
        if (state.index >= seq.length) {
          this.lastTriggerCmd = cmd;
          console.log("适配成功:", cmd.name);
        }
      } else {
        state.index = 0;
        state.lastTime = -1; 
      }
      

    }
  }
}
