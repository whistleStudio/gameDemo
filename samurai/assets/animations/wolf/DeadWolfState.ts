import { _decorator, Component, Node, animation, Vec3 } from "cc";
const { ccclass, property } = _decorator;
import { EventBus, StatesManager } from "../../scripts/StatesManager";

@ccclass("DeadWolfState")
export class DeadWolfState extends animation.StateMachineComponent {
  private originalPos: Vec3;
  private TOTAL_CLIP_FRAMES: number = 4;
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
    this.originalPos = controller.node.position.clone();
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
    controller.node.destroy()
    EventBus.emit("enemyCountChanged", { count: StatesManager.instance.enemyCount - 1 });
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
    const progress = motionStateStatus.progress;
    switch(Math.floor(progress / (1 / this.TOTAL_CLIP_FRAMES))) {
      case 0:
        break;
      default:
        controller.node.setPosition(this.originalPos.clone().add(new Vec3(0, -28, 0)));
    }
    // console.log("DeadWolfState playing:", progress);
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
