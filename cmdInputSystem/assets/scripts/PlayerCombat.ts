import { _decorator, animation, Component, find, instantiate, Prefab } from "cc";
import { CommandInput } from "./CommandInput";
const { ccclass, property } = _decorator;

@ccclass("PlayerCombat")
export class PlayerCombat extends Component {
  @property(animation.AnimationController)
  private animCtrl: animation.AnimationController = null!;
  @property(Prefab)
  private chargePrefab: Prefab = null!;
  @property(Prefab)
  private firePrefab: Prefab = null!;

  private cmdInput: CommandInput = null!;

  onLoad() {
    this.cmdInput = this.getComponent(CommandInput)!;
    this.cmdInput.eventTarget.on("command", this.onCommand, this);
  }

  // 技能触发回调
  onCommand(name: string) {
    this.animCtrl.setValue("isCasting", true);
    const form = this.animCtrl.getValue("form");
    if (name === "elementalWhip") {
      if (form === 0) {
        console.log("释放闪电链!");
        this.animCtrl.setValue("triggerLightCharge", true);
      } else {
        console.log("释放火焰喷射!");
        this.animCtrl.setValue("triggerFlamejet", true);
      }
    } else if (name === "lightBall") {
      console.log("闪电球!");
      this.animCtrl.setValue("triggerLightBall", true);
    } else if (name === "fireBall") {
      console.log("火焰球!");
      this.animCtrl.setValue("triggerFireBall", true);
    }
  }

  // 闪电球动效
  activateCharge () {
    const chargeNode = instantiate(this.chargePrefab);
    find("Canvas/spellLayer").addChild(chargeNode);
  }

  // 火焰球动效
  activateFire () {
    const fireNode = instantiate(this.firePrefab);
    find("Canvas/spellLayer").addChild(fireNode);
  }
}
