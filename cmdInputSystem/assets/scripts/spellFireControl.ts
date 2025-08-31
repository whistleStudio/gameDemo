import { _decorator, Component, Node, tween, find } from "cc";
import { CommandInput } from "./CommandInput";
const { ccclass, property } = _decorator;

@ccclass("spellFireControl")
export class spellFireControl extends Component {
  start() {
    const cmdInput = find("Canvas/roleLayer/wizard").getComponent(CommandInput);
    if (!cmdInput) return;

    const facingRight = cmdInput.facingRight ? 1 : -1;
    const playerWorldPos = cmdInput.node.getWorldPosition();
    this.node.setWorldPosition(playerWorldPos.x + 43 * facingRight, playerWorldPos.y + 20, playerWorldPos.z);
    this.node.setScale(facingRight, 1, 1);
    tween(this.node)
    .to(0.8, { position: new Node().position.set(this.node.position.x + 200 * facingRight, this.node.position.y, this.node.position.z) })
    .call(() => {
      this.node.destroy();
    })
    .start();
  }

  update(deltaTime: number) {}
}
