import { _decorator, Color, Component, Label, Node } from "cc";
const { ccclass, property } = _decorator;
import { InputKey, isInputKey } from "./CommandInput";
import { touchKeyMap } from "./wizardControl";

const inputKeyStrMap: Record<InputKey, string> = {
  LEFT: "◀︎",
  RIGHT: "▶︎",
  UP: "▲",
  DOWN: "▼",
  A: "A",
  B: "B",
  C: "C",
}

@ccclass("cmdkControl")
export class cmdkControl extends Component {
  @property({type: String, tooltip: "输入按键名称"})
  inputKey: InputKey = "RIGHT";

  start() {
    const label = this.getComponent(Label);
    if (isInputKey(this.inputKey)) {
      console.log("当前输入按键:", this.inputKey);
      label.string = inputKeyStrMap[this.inputKey];
      label.color = new Color("ffffff");
    }

    // this.node.on("keyTriggered", this.onKeyTriggered, this);  
  }

  update(deltaTime: number) {
    
  }

  // onKeyTriggered(event: EventKeyboard) {
  //   const label = this.getComponent(Label);
  //   if (isInputKey(this.inputKey)) {
  //     console.log("当前输入按键:", this.inputKey);
  //     label.string = inputKeyStrMap[this.inputKey];
  //     label.color = new Color("ffffff");
  //   }
  // }
}
