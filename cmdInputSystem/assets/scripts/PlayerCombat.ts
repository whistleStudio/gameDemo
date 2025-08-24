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