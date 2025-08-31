import { _decorator, Component,  find, Node, tween, Vec3 } from "cc";
import { CommandInput } from "./CommandInput";
const { ccclass, property } = _decorator;


@ccclass("spellChargeControl")
export class spellChargeControl extends Component {
  start() {
    const cmdInput = find("Canvas/roleLayer/wizard").getComponent(CommandInput);
    if (!cmdInput) return;

    const facingRight = cmdInput.facingRight ? 1 : -1;
    const playerWorldPos = cmdInput.node.getWorldPosition();
    this.node.setWorldPosition(playerWorldPos.x + 30 * facingRight, playerWorldPos.y + 20, playerWorldPos.z);
    this.node.setScale(facingRight, 1, 1);
    tween(this.node)
      .to(0.8, { position: new Vec3(this.node.position.x + 300 * facingRight, this.node.position.y, this.node.position.z) })
      .call(() => {
        this.node.destroy();
      })
      .start();
  }

  update(deltaTime: number) {}
}
