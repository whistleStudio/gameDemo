import { _decorator, Component, Node, animation, director, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("WalkState")
export class WalkState extends animation.StateMachineComponent {
  speed: number = 2;
  groundLimit = {min: -135, max: -75};
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
    // 角色位移
    console.log("Walking...Dir:", controller.getValue_experimental("moveDir"));
    const moveDir = controller.getValue_experimental("moveDir") as Vec3;
    const deltaPos = moveDir.clone().multiplyScalar(this.speed); // 避免跳变深拷贝
    const pos = controller.node.position.clone().add(deltaPos);
    // 限制y轴范围
    pos.y = Math.max(this.groundLimit.min, Math.min(this.groundLimit.max, pos.y));
    controller.node.setPosition(pos);
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
}
