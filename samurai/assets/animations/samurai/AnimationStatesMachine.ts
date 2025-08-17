import { _decorator, Component, input, Node, Input, EventKeyboard, KeyCode, animation, EventTouch, Vec3 } from "cc";
const { ccclass, property } = _decorator;
import { StatesManager } from "../../scripts/StatesManager";

@ccclass("AnimationStatesMachine")
export class AnimationStatesMachine extends Component {
  animationController: animation.AnimationController;
  keyPressed: Set<KeyCode> = new Set(); // 记录当前按下的键

  start() {
    this.animationController = this.getComponent(animation.AnimationController);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  update(deltaTime: number) {
    const dir = new Vec3();
    
    if (this.keyPressed.has(KeyCode.KEY_W)) dir.y += 1;
    if (this.keyPressed.has(KeyCode.KEY_S)) dir.y -= 1;
    if (this.keyPressed.has(KeyCode.KEY_A)) dir.x -= 1;
    if (this.keyPressed.has(KeyCode.KEY_D)) dir.x += 1;
    // 设置速度
    if (dir.x !== 0 || dir.y !== 0) {
      this.animationController.setValue("clickWalk", true);
      this.animationController.setValue_experimental("moveDir", dir.clone().normalize()); // 避免跳变最好深拷贝
      StatesManager.instance.playerMoveDir = dir.clone().normalize();
    } else {
      this.animationController.setValue("clickWalk", false);
      this.animationController.setValue_experimental("moveDir", Vec3.ZERO);
      StatesManager.instance.playerMoveDir = Vec3.ZERO;
    }
  }

  onKeyDown(event: EventKeyboard) {
    console.log("Key pressed:", event.keyCode);
    this.keyPressed.add(event.keyCode);

    switch (event.keyCode) {
      case KeyCode.KEY_J:
        this.animationController.setValue("clickAttack1", true);
        this.animationController.setValue("clickAttack2", true);
        break;
      case KeyCode.SPACE:
        this.animationController.setValue("clickJump", true);
        console.log("Jump animation triggered");
        break;
      // Add more cases for other animations
    }
  }

  onKeyUp(event: EventKeyboard) {
    console.log("Key released:", event.keyCode);
    this.keyPressed.delete(event.keyCode);

    switch (event.keyCode) {
    }
  }

}
