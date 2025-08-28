import { _decorator, Component, Node, tween, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("spellChargeControl")
export class spellChargeControl extends Component {
  start() {
    tween(this.node)
      .to(0.8, { position: new Vec3(this.node.position.x + 300, this.node.position.y, this.node.position.z) })
      .call(() => {
        this.node.destroy();
      })
      .start();
  }

  update(deltaTime: number) {}
}
