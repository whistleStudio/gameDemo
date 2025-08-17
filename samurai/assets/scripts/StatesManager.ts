import { Vec3 } from "cc";

export class StatesManager {
  private static _instance: StatesManager | null = null;

  public playerPos: Vec3 = new Vec3();
  public isBlocked: Boolean = false;
  public playerMoveDir: Vec3 = new Vec3();


  public static get instance(): StatesManager {
    if (!StatesManager._instance) {
      StatesManager._instance = new StatesManager();
    }
    return StatesManager._instance;
  }

  private constructor() {
    // Initialize your state manager here
  }
}