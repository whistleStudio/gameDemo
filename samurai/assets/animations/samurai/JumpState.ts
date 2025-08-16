import { _decorator, Component, Node, animation, Vec3, Animation } from "cc";
const { ccclass, property } = _decorator;


// jump -> attack2 如果设置周期!=0可能导致在跳跃快结束的时候劈砍，但周期未结束，再次进行跳跃动作
@ccclass("JumpState")
export class JumpState extends animation.StateMachineComponent {
  private startY: number = 0;
  private maxHeight: number = 50;
  private speedX: number = 1.5;
  private jumpProgress: number = 0; // 跳跃进度
  private dropH: number = 0; // 下落点的高度
  private groundLimit = {min: -135, max: -75};


  
  /**
   * Called right after a motion state is entered.
   * @param controller The animation controller it within.
   * @param motionStateStatus The status of the motion.
   */
  public onMotionStateEnter(
    controller: animation.AnimationController,
    motionStateStatus: Readonly<animation.MotionStateStatus>
  ): void {
    this.jumpProgress = controller.getValue("jumpProgress") as number || 0; // 获取跳跃进度
    console.log("JumpState: onMotionStateEnter", controller.node.position, controller.getValue("jumpProgress"));
    this.startY = controller.node.position.y;
    if (this.jumpProgress > 0) {
      // 从空中落下
      // const modifiedProgress = Math.abs(this.jumpProgress - 0.5) + 0.5;
      this.dropH = this.maxHeight * (1 - Math.pow(2 * this.jumpProgress - 1, 2)); // 初始起跳上升的距离
      // 防止超出下边界
      this.maxHeight = Math.min(this.dropH, this.startY - this.groundLimit.min); // attack2->jump, 终点起始时间为0.5次，所以此时位置应为最高点
      this.startY = Math.max(this.groundLimit.min, controller.node.position.y - this.dropH); // 初始起跳位置
    }
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

    // 校正：实际完整1遍播放完毕时，progress略大于0
    if (Math.floor(motionStateStatus.progress * 100) == 0) {
      controller.setValue("jumpProgress", 0); // 重置跳跃进度
      const pos = controller.node.position.clone(); // position只读，深拷贝再修改
      pos.y = this.startY;
      controller.node.setPosition(pos);
    }
    else controller.setValue("jumpProgress", motionStateStatus.progress); // 重置跳跃进度
    console.log("JumpState: onMotionStateExit", motionStateStatus.progress, controller.getValue("jumpProgress"));
    this.maxHeight = 50; // 重置最大高度
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
    // console.log("JumpState: onMotionStateUpdate", this.jumpProgress);
    // 抛物线为模拟重力高度变化规律非轨迹。仅跳跃为完整抛物线；jump->attack2抛物线前半段；attack2->jump抛物线后半段
    const t = motionStateStatus.progress; // 归一化时间
    // console.log("JumpState: onMotionStateUpdate", t);
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
