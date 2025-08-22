import { _decorator, Component, Node, ProgressBar } from "cc";
const { ccclass, property } = _decorator;
import { StatesManager, EventBus } from "./StatesManager";

@ccclass("uiControl")
export class uiControl extends Component {
  @property(ProgressBar)
  hpBar: ProgressBar | null = null;

  start() {
    this.hpBar.progress = StatesManager.instance.playerHp;
    EventBus.on("playerHpChanged", this.changeHpHandle, this);
  }

  update(deltaTime: number) {}

  // 调整血条
  changeHpHandle ({hp}) {
    this.hpBar.progress = hp;
  }
}
