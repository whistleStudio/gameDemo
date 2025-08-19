import { _decorator, Component, Node, animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("DeadSamState")
export class DeadSamState extends animation.StateMachineComponent {
  private playIdx: number = 0;
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
    console.log("DeadSamState exited:", this.playIdx);
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
    console.log("DeadSamState playing:", this.playIdx);
    const progress = motionStateStatus.progress;
    // 图片透明裁剪的原因，导致位置有些偏移，纠正一下
    const pos = controller.node.position.clone();
    const lastPlayIdx = this.playIdx;
    switch (true) {
      case progress <= 1/3:
        break;
      case progress <= 2/3:
        this.playIdx = 1
        pos.y -= 10;
        break;
      case progress <= 1:
        this.playIdx = 2
        pos.y -= 20;
    }
    if (lastPlayIdx !== this.playIdx) {
      controller.node.setPosition(pos);
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
}
