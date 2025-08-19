import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node,  animation, Vec2, Vec3} from "cc";
const { ccclass, property } = _decorator;
import { StatesManager } from "./StatesManager";

interface colliderRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

@ccclass("samuraiControl")
export class samuraiControl extends Component {
  @property(BoxCollider2D)
  playerCollider: BoxCollider2D = null;
  @property(BoxCollider2D)
  attackCollider: BoxCollider2D = null;
  @property
  speed: number = 15; // 脱离速度

  animationController: animation.AnimationController;

  start() {
    this.animationController = this.getComponent(animation.AnimationController);

    // 受伤检定
    this.playerCollider.on(Contact2DType.BEGIN_CONTACT, this.onPlayerBeginContact, this);

    // 攻击检定
    this.attackCollider.enabled = false
    this.attackCollider.on(Contact2DType.BEGIN_CONTACT, this.onAttackBeginContact, this);


  }

  update(deltaTime: number) {
    // 获取玩家碰撞盒
    const newPlayerPos = this.node.position.clone().add(StatesManager.instance.playerMoveDir.clone().multiplyScalar(this.speed));
    const newPlayerRect = this._getColliderRect(this.playerCollider, newPlayerPos);
    // 角色阻挡检定
    const roles = this.node.parent.children;
    let isBlockedFlag = false;
    for (let role of roles) {
      if (role !== this.node) { // 不是当前玩家节点
        const enemyCollider = role.getComponents(BoxCollider2D)[0]; // 第一个盒子为身体
        const enemyRect = this._getColliderRect(enemyCollider, role.position);
        // 伪纵深：只在y坐标接近时判断阻挡
        if (Math.abs(role.position.y - this.node.position.y) > 10) continue;
        if (this._isRectOverlap(newPlayerRect, enemyRect)) {
          isBlockedFlag = true;
          // console.log("Player is blocked by enemy:", role.name);
          break;
        }
      }
    }
    StatesManager.instance.isBlocked = isBlockedFlag;
  }

  // 获取碰撞盒
  _getColliderRect(collider: BoxCollider2D, position: Vec3): colliderRect {
    const colliderPos = new Vec2(
      position.x + this.playerCollider.offset.x,
      position.y + this.playerCollider.offset.y
    )
    const size = collider.size;
    return {
      left: colliderPos.x - size.x / 2,
      right: colliderPos.x + size.x / 2,
      top: colliderPos.y + size.y / 2,
      bottom: colliderPos.y - size.y / 2
    }
  }

  // AABB重叠检定
  _isRectOverlap(rectA: colliderRect, rectB: colliderRect) {
    return !(
      rectA.right < rectB.left ||
      rectA.left > rectB.right ||
      rectA.top < rectB.bottom ||
      rectA.bottom > rectB.top
    );
  }

  onActiveAttack1 () {
    this.attackCollider.enabled = true;
    console.log("Attack collider enabled");
  }

  onDeactiveAttack1 () {
    this.attackCollider.enabled = false;
    console.log("Attack collider disabled");
  }

  // group: 1 角色主体 / 2 敌人 / 4 攻击区
  // 受伤回调
  onPlayerBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    console.log("Player begin contact with:", otherCollider.node.name);
    if (otherCollider.group === 4) {
      const isShield = this.animationController.getValue("clickShield");
      const isDead = this.animationController.getValue("isDead");
      if (Math.abs(selfCollider.node.position.y - otherCollider.node.position.y) <= 10 && !isShield && !isDead) { // 纵深接近且未格挡
        this.animationController.setValue("isHurt", true)
        StatesManager.instance.playerHp -= 0.34; // 掉血
        console.log("playerHp:", StatesManager.instance.playerHp)
        if (StatesManager.instance.playerHp <= 0.001) {
          this.animationController.setValue("isDead", true);
        }
      }
    }
  }

  onAttackBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
      
      console.log("selfCollider:", selfCollider.group, selfCollider.tag);
      console.log("otherCollider:", otherCollider.group, otherCollider.tag);


  }


}
