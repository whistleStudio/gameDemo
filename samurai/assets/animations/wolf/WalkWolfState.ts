import { _decorator, Component, Node, animation } from "cc";
const { ccclass, property } = _decorator;
import { StatesManager } from "../../scripts/StatesManager";


@ccclass("WalkWolfState")
export class WalkWolfState extends animation.StateMachineComponent {
  private ATTACK_RANGE: number = 50; // 攻击范围
  private ATTACK1_CD: number = 0.5; // 攻击1冷却时间(s)
  private time_attack1: number;
  private SPEED: number = 2; // 移动速度

  /**
   * Called right after a motion state is entered.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateEnter(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    // Can be overrode
    this.restTim()
  }

  /**
   * Called when a motion state is about to exit.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateExit(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    // Can be overrode
    controller.setValue("canAttack", false);
  }

  /**
   * Called when a motion state updated except for the first and last frame.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateUpdate(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    
    /* AI寻玩家 */
    const deltaVec = StatesManager.instance.playerPos.clone().subtract(controller.node.position);
    const distance = deltaVec.length();
    // console.log("Wolf distance to player:", distance);
    if (distance <= this.ATTACK_RANGE) {
      if (new Date().getTime() - this.time_attack1 > this.ATTACK1_CD * 1000) {
        controller.setValue("canAttack", true);
      }
    } else {
      const dir = deltaVec.normalize();
      const deltaPos = dir.multiplyScalar(this.SPEED);
      controller.node.setPosition(controller.node.position.add(deltaPos));
      const scaleX = dir.x > 0 ? 1 : -1;
      controller.node.setScale(scaleX, 1, 1);
      // console.log("Wolf is moving towards player");
    }
  }

  /**
   * Called right after a state machine is entered.
   * @param controller The animation controller it within.
   */
  public onStateMachineEnter(controller: animation.AnimationController) {
    // Can be overrode
  }

  /**
   * Called right after a state machine is entered.
   * @param controller The animation controller it within.
   */
  public onStateMachineExit(controller: animation.AnimationController) {
    // Can be overrode
  }

  private restTim () {
    this.time_attack1 = new Date().getTime();
  }
}
