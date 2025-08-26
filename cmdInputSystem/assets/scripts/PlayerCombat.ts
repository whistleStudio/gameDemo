import { _decorator, animation, Component, find, instantiate, Prefab } from "cc";
import { CommandInput } from "./CommandInput";
const { ccclass, property } = _decorator;

@ccclass("PlayerCombat")
export class PlayerCombat extends Component {
  @property(animation.AnimationController)
  private animCtrl: animation.AnimationController = null!;
  @property(Prefab)
  private chargePrefab: Prefab = null!;

  private cmdInput: CommandInput = null!;

  onLoad() {
    this.cmdInput = this.getComponent(CommandInput)!;
    this.cmdInput.eventTarget.on("command", this.onCommand, this);
  }

  // 技能触发回调
  onCommand(name: string) {
    this.animCtrl.setValue("isCasting", true);
    if (name === "lightCharge") {
      console.log("释放闪电链!");
      this.animCtrl.setValue("triggerLightCharge", true);
    } else if (name === "lightBall") {
      console.log("闪电球!");
      this.animCtrl.setValue("triggerLightBall", true);
    } else if (name === "dash") {
      console.log("前冲!");
    }
  }

  // 闪电球动效
  activateCharge () {
    const chargeNode = instantiate(this.chargePrefab);
    const playerWorldPos = this.node.getWorldPosition();
    console.log("playerWorldPos:", playerWorldPos);
    find("Canvas/spellLayer").addChild(chargeNode);
    chargeNode.setWorldPosition(playerWorldPos.x + 30, playerWorldPos.y + 20, playerWorldPos.z);
    console.log("spellCharge:", chargeNode.getWorldPosition());
    // this.node.addChild(chargeNode);
  }
}
