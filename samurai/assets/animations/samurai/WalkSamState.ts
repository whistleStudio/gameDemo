import { _decorator, Component, Node, animation, director, Vec3 } from "cc";
const { ccclass, property } = _decorator;
import { StatesManager } from "../../scripts/StatesManager";

@ccclass("WalkSamState")
export class WalkSamState extends animation.StateMachineComponent {
  speed: number = 2;
  groundLimit = {min: -135, max: -75};

  public onMotionStateEnter(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
  }


  public onMotionStateExit(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    // Can be overrode
  }


  public onMotionStateUpdate(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    /* 角色位移 */
    // console.log("Walking...Dir:", controller.getValue_experimental("moveDir"));
    if (StatesManager.instance.isBlocked) return;
    const moveDir = StatesManager.instance.playerMoveDir.clone();
    const deltaPos = moveDir.clone().multiplyScalar(this.speed); // 避免跳变深拷贝
    const pos = controller.node.position.clone().add(deltaPos);
    // 限制y轴范围
    pos.y = Math.max(this.groundLimit.min, Math.min(this.groundLimit.max, pos.y));
    controller.node.setPosition(pos);
    // 改变朝向
    if (moveDir.x > 0) controller.node.setScale(1, 1, 1);
    else if (moveDir.x < 0) controller.node.setScale(-1, 1, 1);
    // 更新全局状态-玩家位置
    StatesManager.instance.playerPos = controller.node.position.clone();
  }


  public onStateMachineEnter(controller: animation.AnimationController) {
    // Can be overrode
  }


  public onStateMachineExit(controller: animation.AnimationController) {
    // Can be overrode
  }
}
