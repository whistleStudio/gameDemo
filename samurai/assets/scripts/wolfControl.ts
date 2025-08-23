import { _decorator, animation, BoxCollider2D, Component, Contact2DType, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("wolfControl")
export class wolfControl extends Component {
  @property(BoxCollider2D)
  bodyCollider: BoxCollider2D = null;

  @property(BoxCollider2D)
  attackCollider: BoxCollider2D = null;

  @property(animation.AnimationController)
  animController: animation.AnimationController = null;

  hp: number = 1;

  start() {
    this.bodyCollider.on(Contact2DType.BEGIN_CONTACT, this.onBodyBeginContact, this);

  }

  update(deltaTime: number) {}

  onActivateAttack1 () {
    // console.log("Wolf Attack1 triggered");
    this.attackCollider.enabled = true;
  }

  onDeactivateAttack1 () {
    // console.log("Wolf Attack1 deactivated");
    this.attackCollider.enabled = false;
  }

  onBodyBeginContact (selfCollider: BoxCollider2D, otherCollider: BoxCollider2D) {
    // 受伤检定
    if (otherCollider.group === 4 && otherCollider.tag === 100) { // tag 101为玩家攻击碰撞体
      const isDead = this.animController.getValue("isDead");
      if (Math.abs(selfCollider.node.position.y - otherCollider.node.position.y) < 10 && !isDead) {
        // 触发受伤逻辑
        this.animController.setValue("isHurt", true);
        this.hp -= 0.34; // 掉血
        if (this.hp <= 0.001) {
          this.animController.setValue("isDead", true);
        }
        // 增加打击感：击退
        const pos = selfCollider.node.position.clone()
        const knockbackDir = Math.sign(pos.x - otherCollider.node.position.x); // 只留方向
        pos.x += knockbackDir * 12
        selfCollider.node.setPosition(pos);
      }
    }
  }
}
