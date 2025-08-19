import { _decorator, BoxCollider2D, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("wolfControl")
export class wolfControl extends Component {
  @property(BoxCollider2D)
  attackCollider: BoxCollider2D = null;

  start() {}

  update(deltaTime: number) {}

  onActivateAttack1 () {
    // console.log("Wolf Attack1 triggered");
    this.attackCollider.enabled = true;
  }

  onDeactivateAttack1 () {
    // console.log("Wolf Attack1 deactivated");
    this.attackCollider.enabled = false;
  }
}
