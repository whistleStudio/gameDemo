import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node,  animation, Vec2, Vec3, UI, UITransform, find, view, AudioClip, resources, AudioSource, ParticleSystem2D, Color} from "cc";
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
  @property(ParticleSystem2D)
  bloodHitEffect: ParticleSystem2D = null;
  @property(ParticleSystem2D)
  bloodHurtEffect: ParticleSystem2D = null;

  isHitTarget: boolean = false;

  animationController: animation.AnimationController;

  audioClipsHitAir: AudioClip[] = [];
  audioClipsHitFlesh: AudioClip[] = [];
  audioClipsShield: AudioClip[] = [];
  audioClipHurt: Record<string, AudioClip> = {};

  audioSource: AudioSource = null;

  protected onLoad(): void {
    this.audioSource = this.getComponent(AudioSource);

    resources.loadDir("audios/samurai/hit-air", AudioClip, (err, assets) => {
      this.audioClipsHitAir = assets;
    })
    resources.loadDir("audios/samurai/hit-flesh", AudioClip, (err, assets) => {
      this.audioClipsHitFlesh = assets;
    })
    resources.loadDir("audios/samurai/shield", AudioClip, (err, assets) => {
      this.audioClipsShield = assets;
    })
    resources.load("audios/samurai/hurt/claw-flesh0", AudioClip, (err, asset) => {
      this.audioClipHurt[101] = asset;
    })
  }

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
    let audioList = this.audioClipsHitAir;
    if (this.isHitTarget) {
      EventBus.emit("freezeFrame", {dur: 0.1}); // 画面定格
      audioList = this.audioClipsHitFlesh; // 刀肉音效
      // 飙血
      const playerWorldPos = this.node.getWorldPosition();
      const attackDirX = this.node.scale.x > 0 ? 1 : -1;
      this.bleedEffectPlay(this.bloodHitEffect, playerWorldPos, {offsetX: 50, dir: attackDirX, colorHexStr: "4E1010", speed: 350});
    }
    this.playAudio(audioList);
  }

  onDeactiveAttack1 () {
    this.attackCollider.enabled = false;
    this.isHitTarget = false;
  }

  onActivateAttack2 () { // 跳劈偷懒只写了个砍空气的逻辑
    this.attackCollider.enabled = true;
    this.playAudio(this.audioClipsHitAir);
  }

  onDeactivateAttack2 () {
    this.attackCollider.enabled = false;
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
        if (isShield && !isShieldBroken) { // 格挡成功
          this.playAudio(this.audioClipsShield);
          EventBus.emit("cameraShake", {dur: 0.1, magnitude: 2}); // 镜头晃动
          const pos = selfCollider.node.position.clone();
          pos.x += Math.sign(pos.x - otherCollider.node.position.x) * 1;
          selfCollider.node.setPosition(pos);
          return;
        }
        const tag = otherCollider.tag;
        if (this.audioClipHurt[tag]) {
          this.audioSource.playOneShot(this.audioClipHurt[tag]);
        }
        this.animationController.setValue("isHurt", true)
        StatesManager.instance.playerHp -= 0.34; // 掉血
        // 飙血动画
        const playerWorldPos = this.node.getWorldPosition();
        const bleedDir = enemy2playerDir.x > 0 ? -1 : 1;
        this.bleedEffectPlay(this.bloodHurtEffect, playerWorldPos, {dir: bleedDir});
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
      EventBus.emit("cameraShake", {dur: 0.2, magnitude: 6}); // 镜头晃动
      this.isHitTarget = true;
    }
  }

  playAudio(audioClips: AudioClip[]) {
    const randomIndex = Math.floor(Math.random() * audioClips.length);
    const audioClip = audioClips[randomIndex];
    this.audioSource.playOneShot(audioClip);
  }


  bleedEffectPlay(bloodParticle: ParticleSystem2D, startPos: Vec3, {offsetX = 5, dir = 1, colorHexStr = "8B1B1B", speed = 100} = {}) {
    bloodParticle.node.setWorldPosition(startPos.x + dir * offsetX, startPos.y, startPos.z);
    bloodParticle.angle = dir > 0 ? 0 : 180;
    bloodParticle.startColor = new Color(colorHexStr);
    bloodParticle.startSpin = dir > 0 ? -120 : 120;
    bloodParticle.endSpin = dir > 0 ? -100 : 100;
    bloodParticle.speed = speed;
    bloodParticle.resetSystem();
  }
}
