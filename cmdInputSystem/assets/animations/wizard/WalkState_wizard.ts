import { _decorator, Component, Node, animation, Vec2, director, game } from "cc";
import { wizardControl } from "../../scripts/wizardControl";
const { ccclass, property } = _decorator;

@ccclass("WalkState_wizard")
export class WalkState_wizard extends animation.StateMachineComponent {
  wizardControl: wizardControl | null = null;
  speed: number = 100;

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
    this.wizardControl = controller.getComponent(wizardControl);
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
    // this.wizardRigidBody!.linearVelocity = new Vec2(0, 0);
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
    const dt = game.deltaTime;
    const dir = this.wizardControl!.dir;
    console.log("dir:", dir);
    controller.node.setScale(dir.x, 1);
    controller.node.setPosition(controller.node.position.x + dir.x * dt * this.speed, controller.node.position.y);
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
