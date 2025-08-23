import { _decorator, Component, Node, ProgressBar, tween } from "cc";
const { ccclass, property } = _decorator;
import { StatesManager, EventBus } from "./StatesManager";

@ccclass("uiControl")
export class uiControl extends Component {
  @property(ProgressBar)
  hpBar: ProgressBar | null = null;
  @property(Node)
  nextArrow: Node | null = null;

  start() {
    this.hpBar.progress = StatesManager.instance.playerHp;
    EventBus.on("playerHpChanged", this.changeHpHandle, this);
    this.nextArrow.active = false;
    EventBus.on("enemyCountChanged", ({ count }) => {
      if (count <= 0) {
        this.schedule(() => {
          this.nextArrow.active = !this.nextArrow.active;
        }, 0.5)
      }
    }, this);
  }

  update(deltaTime: number) {
  }

  // 调整血条
  changeHpHandle ({hp}) {
    this.hpBar.progress = hp;
  }
}
