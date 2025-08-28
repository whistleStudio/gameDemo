import { _decorator, Component, Node, tween } from "cc";
const { ccclass, property } = _decorator;

@ccclass("spellFireControl")
export class spellFireControl extends Component {
  start() {
    tween(this.node)
    .to(0.8, { position: new Node().position.set(this.node.position.x + 200, this.node.position.y, this.node.position.z) })
    .call(() => {
      this.node.destroy();
    })
    .start();
  }

  update(deltaTime: number) {}
}
