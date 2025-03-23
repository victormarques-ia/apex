class DI {
  private static instance: DI

  private constructor() {}

  public static getInstance(): DI {
    if (!DI.instance) {
      DI.instance = new DI()
    }
    return DI.instance
  }
}

export const di = DI.getInstance()
