import { _decorator, Component, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;
import {EventBus} from "../scripts/StatesManager";

@ccclass("cameraShake")
export class cameraShake extends Component {
  private _isShaking: boolean = false;
  private _shakeMagnitude: number = 2;
  private _shakeDuration: number = 0.5;
  private _originalPos: Vec3 = null;
  private _elapsed: number = 0;


  protected onLoad(): void {
    EventBus.on("cameraShake", this.startShake, this);  
  }

  start() {
    this._originalPos = this.node.position.clone();
  }

  update(deltaTime: number) {
    if (this._isShaking) {
      this._elapsed += deltaTime;
      const progress = this._elapsed / this._shakeDuration;
      if (progress >= 1) {
        this._isShaking = false;
        this.node.position = this._originalPos.clone();
      } else {
        const dir = new Vec3()
        const offset = Vec3.random(dir).multiplyScalar(this._shakeMagnitude * (1 - progress)); // 缓出效果
        this.node.position = this._originalPos.clone().add(offset);
      }
    }
  }

  public startShake({dur = 0.5, magnitude = 1} = {}) {
    if (this._isShaking) return; // Prevent multiple shakes at the same time
    this._shakeDuration = dur;
    this._shakeMagnitude = magnitude;
    this._isShaking = true;
    this._elapsed = 0;
  }

  public stopShake() {
    this._isShaking = false;
  }
}
