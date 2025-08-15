import { _decorator, Component, Node, animation, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("JumpState")
export class JumpState extends animation.StateMachineComponent {
  private startY: number = 0;
  private maxHeight: number = 50;
  private speedX: number = 1.5;
  /**
   * Called right after a motion state is entered.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateEnter(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    console.log("JumpState: onMotionStateEnter", controller.node.position);
    this.startY = controller.node.position.y;
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
    const pos = controller.node.position.clone(); // position只读，深拷贝再修改
    pos.y = this.startY;
    controller.node.setPosition(pos);
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
    const t = motionStateStatus.progress; // 归一化时间
    controller.setValue("jumpProgress", t);
    console.log("JumpState: onMotionStateUpdate", t);
    const height = this.maxHeight * (1 - Math.pow(2 * t - 1, 2)); // 模拟抛物线变化的高度
    const pos = controller.node.position.clone(); // position只读，深拷贝再修改
    // Y轴位移
    pos.y = this.startY + height;
    // X轴位移
    const moveDir = controller.getValue_experimental("moveDir") as Vec3;
    if (Math.abs(moveDir.x) > 0) pos.x += this.speedX * Math.round(moveDir.x);
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
