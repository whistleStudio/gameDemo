import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node,  animation, Vec2, Vec3, UI, UITransform, find, view} from "cc";
const { ccclass, property } = _decorator;
import { StatesManager, EventBus } from "./StatesManager";

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

  isHitTarget: boolean = false;

  animationController: animation.AnimationController;

  start() {
    // 屏幕尺寸
    const canvas = find("Canvas");
    console.log("size:", view.getVisibleSize());
    console.log("visible size:", StatesManager.instance.visibleSize);


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

  onCheckAttack1Keyframe () {
    if (this.isHitTarget) {
      EventBus.emit("freezeFrame", {dur: 0.3});
    }
  }

  onDeactiveAttack1 () {
    this.attackCollider.enabled = false;
    this.isHitTarget = false;
    console.log("Attack collider disabled");
  }

  // group: 1 角色主体 / 2 敌人 / 4 攻击区
  // 受伤回调
  onPlayerBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    // console.log("Player begin contact with:", otherCollider.node.name);
    if (otherCollider.group === 4) {
      const isShield = this.animationController.getValue("clickShield");
      const isDead = this.animationController.getValue("isDead");
      // console.log("before set --- isShield:", isShield, "isShieldBroken:", this.animationController.getValue("isShieldBroken"));
      // 面朝方
      const playerFacingDir = new Vec2(selfCollider.node.scale.x > 0 ? 1 : -1, 0);
      const enemy2playerDir = new Vec2(otherCollider.node.position.x - selfCollider.node.position.x, 0); // 横板卷轴忽视了y
      const isShieldBroken = playerFacingDir.dot(enemy2playerDir) < 0; // 有效格挡防御同攻击方向的夹角范围放在了cos±90度内(>0), 虽然这里实际角度只会0或180
      this.animationController.setValue("isShieldBroken", isShieldBroken); // 破盾
      // console.log("after set --- isShield:", isShield, "isShieldBroken:", isShieldBroken);
      if (Math.abs(selfCollider.node.position.y - otherCollider.node.position.y) <= 10 && !isDead) { // 纵深接近且未格挡
        if (isShield && !isShieldBroken) return; // 格挡成功
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
    if (otherCollider.group === 2) {
      /* 打击感实现 */
      EventBus.emit("cameraShake", {dur: 0.3, magnitude: 2}); // 镜头晃动
      this.isHitTarget = true;
    }
  }


}
