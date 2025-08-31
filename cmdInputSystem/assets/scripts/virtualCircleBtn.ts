import { _decorator, Camera, Component, EventTouch, find, KeyCode, Node, UITransform, Vec2, Vec3 } from "cc";
import { CommandInput } from "./CommandInput";
import { wizardControl } from "./wizardControl";
const { ccclass, property } = _decorator;

type InputKey = "LEFT" | "RIGHT" | "UP" | "DOWN" | "A" | "B" | "C";


@ccclass("virtualCircleBtn")
export class virtualCircleBtn extends Component {
  @property
  keyTouch: InputKey = "LEFT";

  @property(CommandInput)
  cmdInput: CommandInput | null = null;

  @property
  circleRadius: number = 45;

  @property(wizardControl)
  wizardCtrl: wizardControl | null = null;

  private center: Vec2 = new Vec2(); // 按钮圆心

  protected onLoad(): void {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  start() {}

  update(deltaTime: number) {}

  protected onTouchStart(event: EventTouch): void {
    // console.log("touched:", this.keyTouch);
    this.cmdInput?.onKeyDown(null, this.keyTouch);
    this.wizardCtrl?.onKeyDown(null, this.keyTouch);
  }

  protected onTouchEnd(event: EventTouch): void {
    this.wizardCtrl?.onKeyUp(null, this.keyTouch);
  }
}
