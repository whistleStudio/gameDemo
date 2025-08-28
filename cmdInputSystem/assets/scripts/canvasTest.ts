import { _decorator, Component, Node, EventTouch } from "cc";
const { ccclass, property } = _decorator;

@ccclass("canvasTest")
export class canvasTest extends Component {
  start() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    console.log("canvas worldpos:", this.node.getWorldPosition());
  }

  update(deltaTime: number) {}

  private onTouchStart(event: EventTouch) {
    console.log("Touch started:", event.getLocation(), event.getUILocation(), event.getLocationInView());
  }
}
