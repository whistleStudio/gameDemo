import { _decorator, Component, Node, animation, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Attack1State_wizard")
export class Attack1State_wizard extends animation.StateMachineComponent {
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
    this.startPos = controller.node.position.clone();
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
    // Can be overrode
    // 矫正attack1动画位置偏移问题
    const progress = motionStateStatus.progress;
    const curIdx = Math.floor(progress * 10);
    if (this.frameIdx !== curIdx) {
      const newPos = this.startPos.clone();
      this.frameIdx = curIdx;
      // console.log("frameIdx:", this.frameIdx);
      switch (this.frameIdx) {
        case 2:
          newPos.y += 4;
          break;
        case 3:
        case 7:
        case 8:
          newPos.y += 9;
          break;
        case 4:
        case 5:
          newPos.y += 2;
          break;
        case 6:
          newPos.y += 11;
          break;
        case 9:
        case 0:
          newPos.y += 7;
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
