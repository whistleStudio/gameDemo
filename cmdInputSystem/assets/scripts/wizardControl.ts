import { _decorator, Component, Input, input, KeyCode, Node, EventKeyboard, Vec2, animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("wizardControl")
export class wizardControl extends Component {
  @property(animation.AnimationController)
  animCtrl: animation.AnimationController | null = null;

  keyPressed: Set<KeyCode> = new Set();
  dir: Vec2 = new Vec2();

  protected onLoad(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  start() {}

  update(deltaTime: number) {
    this.dir.set(0, 0);
    if (this.keyPressed.has(KeyCode.ARROW_LEFT) || this.keyPressed.has(KeyCode.KEY_A)) this.dir.x -=1;
    if (this.keyPressed.has(KeyCode.ARROW_RIGHT) || this.keyPressed.has(KeyCode.KEY_D)) this.dir.x +=1;
    if (this.dir.x !== 0) {
      this.animCtrl.setValue("clickMove", true);
    } else {
      this.animCtrl.setValue("clickMove", false);
    }
  }

  onKeyDown(event: EventKeyboard) {
    this.keyPressed.add(event.keyCode);
  }

  onKeyUp(event: EventKeyboard) {
    this.keyPressed.delete(event.keyCode);
  }
}
