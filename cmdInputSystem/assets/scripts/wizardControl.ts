import { _decorator, Component, Input, input, KeyCode, Node, EventKeyboard, Vec2, animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("wizardControl")
export class wizardControl extends Component {
  @property(animation.AnimationController)
  animCtrl: animation.AnimationController | null = null;

  keyPressed: Set<KeyCode> = new Set();
  dir: Vec2 = new Vec2();
  moveTimer: number = 0;
  moveDelayFrames: number = 5;
  moveDelayTime: number = 0.1; // seconds

  isTriggerSpell: boolean = false;

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
      if ( this.moveTimer < this.moveDelayTime) { // 防止搓招过程中因为移动导致小碎步
        this.moveTimer += deltaTime;
      } else {
        this.animCtrl.setValue("clickMove", true);  
      }
    } else {
      this.moveTimer = 0;
      this.animCtrl.setValue("clickMove", false);
    }
  }

  onKeyDown(event: EventKeyboard) {
    this.keyPressed.add(event.keyCode);
    switch (event.keyCode) {
      case KeyCode.KEY_J:
        this.animCtrl.setValue("triggerAttack1", true);
        console.log("isCasting:", this.animCtrl.getValue("isCasting"));
        break;
      case KeyCode.KEY_K:
        this.animCtrl.setValue("triggerAttack2", true);
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    this.keyPressed.delete(event.keyCode);
  }
}
