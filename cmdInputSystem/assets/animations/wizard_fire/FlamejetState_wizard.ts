import { _decorator, Component, Node, animation, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("FlamejetState_wizard")
export class FlamejetState_wizard extends animation.StateMachineComponent {
  private frameIdx: number = 0;
  private startPos: Vec3 = new Vec3();
  /**
   * Called right after a motion state is entered.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateEnter(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    this.startPos = controller.node.getPosition().clone();
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
    controller.node.setPosition(this.startPos);
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
    // 矫正flamejet动画位置偏移问题
    const progress = motionStateStatus.progress;
    const step = 1 / 14; // 因为有14帧
    const curIdx = Math.floor(progress / step);
    if (curIdx !== this.frameIdx) {
      const newPos = this.startPos.clone();
      switch (curIdx) {
        case 6:
          newPos.y += 2;
          break;
        case 7:
          newPos.y += 6;
          break;
        case 8:
          newPos.y += 7;
          break;
        case 9:
        case 10:
          newPos.y += 5;
          break;
      }
      controller.node.setPosition(newPos);
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
