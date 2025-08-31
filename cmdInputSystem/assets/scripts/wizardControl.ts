import { _decorator, Component, Input, input, KeyCode, Node, EventKeyboard, Vec2, animation } from "cc";
import { CommandInput } from "./CommandInput";
const { ccclass, property } = _decorator;

export const touchKeyMap: Record<string, KeyCode> = {
  "LEFT": KeyCode.ARROW_LEFT,
  "RIGHT": KeyCode.ARROW_RIGHT,
  "UP": KeyCode.ARROW_UP,
  "DOWN": KeyCode.ARROW_DOWN,
  "A": KeyCode.KEY_J,
  "B": KeyCode.KEY_K,
  "C": KeyCode.KEY_L,
  "T": KeyCode.KEY_T,
};

@ccclass("wizardControl")
export class wizardControl extends Component {
  @property(animation.AnimationController)
  animCtrl: animation.AnimationController | null = null;
  @property(CommandInput)
  cmdInput: CommandInput | null = null;

  keyPressed: Set<KeyCode> = new Set();
  dir: Vec2 = new Vec2();
  moveTimer: number = 0;
  moveDelayFrames: number = 5;
  moveDelayTime: number = 0.1; // seconds
  formIdx: number = 0; // 0 雷 / 1 火
  isTriggerSpell: boolean = false;
  changeFacingCallback: Function = null;


  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    this.node.on("padTouched", this.onKeyDown, this);
    this.node.on("padReleased", this.onKeyUp, this);
  }

  start() {}

  update(deltaTime: number) {
    this.dir.set(0, 0);
    if (this.keyPressed.has(KeyCode.ARROW_LEFT) || this.keyPressed.has(KeyCode.KEY_A)) this.dir.x -=1;
    if (this.keyPressed.has(KeyCode.ARROW_RIGHT) || this.keyPressed.has(KeyCode.KEY_D)) this.dir.x +=1;
    if (this.dir.x !== 0) {
      if ( this.moveTimer < this.moveDelayTime) { // 防止搓招过程中因为移动导致小碎步
        this.moveTimer += deltaTime;
      } else {
        this.animCtrl.setValue("clickMove", true);
        // console.log("Moving:", this.dir);
        // 停止一定时间后再改变朝向,避免技能释放过程中的朝向改变，实际还是用延时规避
        this.changeFacingCallback && this.unschedule(this.changeFacingCallback);
        const lastDirX = this.dir.x; // 避免回调时的改变
        this.changeFacingCallback = () => {
          if (lastDirX > 0) {
            this.cmdInput.facingRight = true;
          } else this.cmdInput.facingRight = false;
          console.log("Facing Right:", this.cmdInput.facingRight);
          this.changeFacingCallback = null;
        }
        this.scheduleOnce(this.changeFacingCallback, 0.12);
      }
    } else {
      this.moveTimer = 0;
      this.animCtrl.setValue("clickMove", false);
    }
  }

  // 键盘按下/虚拟手柄触摸事件处理
  onKeyDown(event: EventKeyboard | null, touchKey: string = null) {
    let keyCode = event ? event.keyCode : touchKeyMap[touchKey];
    this.keyPressed.add(keyCode);
    switch (keyCode) {
      case KeyCode.KEY_J:
        this.animCtrl.setValue("triggerAttack1", true);
        console.log("isCasting:", this.animCtrl.getValue("isCasting"));
        break;
      case KeyCode.KEY_K:
        this.animCtrl.setValue("triggerAttack2", true);
        break;
      case KeyCode.KEY_T:
        this.formIdx = (this.formIdx + 1) % 2
        this.animCtrl.setValue("form", this.formIdx); // 0 1 0
        this.node.emit("formChanged", this.formIdx);
        this.animCtrl.setValue("isCasting", false); // 变身取消施法
        break;
    }
  }

  onKeyUp(event: EventKeyboard | null, touchKey: string = null) {
    let keyCode = event ? event.keyCode : touchKeyMap[touchKey];
    this.keyPressed.delete(keyCode);
  }

  // 改变朝向
  changeFacing(isRight: boolean) {
    this.cmdInput.facingRight = isRight;
  }

}
