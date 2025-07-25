import { Camera, PointerEventData, SpriteDrawMode } from "@galacean/engine-core";
import { Color, Vector3 } from "@galacean/engine-math";
import { WebGLEngine } from "@galacean/engine-rhi-webgl";
import { Button, ColorTransition, Image, ScaleTransition, Text, UICanvas, UIGroup, UITransform } from "@galacean/engine-ui";
import { describe, expect, it } from "vitest";

describe("Button", async () => {
  const canvas = document.createElement("canvas");
  const engine = await WebGLEngine.create({ canvas: canvas });
  const webCanvas = engine.canvas;
  webCanvas.width = 750;
  webCanvas.height = 1334;
  const scene = engine.sceneManager.scenes[0];
  const root = scene.createRootEntity("root");

  // Create camera
  const cameraEntity = root.createChild("Camera");
  cameraEntity.transform.position = new Vector3(0, 0, 10);
  const camera = cameraEntity.addComponent(Camera);
  camera.fieldOfView = 60;
  camera.farClipPlane = 200;
  camera.nearClipPlane = 0.3;
  camera.isOrthographic = true;

  // Create group
  const canvasEntity = root.createChild("canvas");
  canvasEntity.addComponent(UIGroup);

  const commonTextEntity = canvasEntity.createChild("commonText")
  const commonText = commonTextEntity.addComponent(Text);

  // Create button
  const buttonEntity = canvasEntity.createChild("Image");
  const image = buttonEntity.addComponent(Image);
  image.drawMode = SpriteDrawMode.Sliced;
  (<UITransform>buttonEntity.transform).size.set(120, 40);
  const textEntity = buttonEntity.createChild("Text");
  (<UITransform>textEntity.transform).size.set(120, 40);
  const text = textEntity.addComponent(Text);
  text.text = "Button";
  text.color.set(0, 0, 0, 1);
  const button = buttonEntity.addComponent(Button);


  it("Set and Get", () => {
    // Click
    let clickCount = 0;
    const onClick = () => {
      clickCount++;
    };
    button.addClicked(onClick);
    button.onPointerClick(new PointerEventData());
    expect(clickCount).to.eq(1);
    button.removeClicked(onClick);
    button.onPointerClick(new PointerEventData());
    expect(clickCount).to.eq(1);

    // Transition
    const scaleTransition = new ScaleTransition();
    button.addTransition(scaleTransition);
    expect(button.transitions.length).to.eq(1);
    scaleTransition.destroy();
    expect(button.transitions.length).to.eq(0);

    // target 指向克隆节点的组件
    const colorTransition = new ColorTransition();
    colorTransition.target = image;
    colorTransition.hover = new Color(0.8, 0.8, 0.8);
    colorTransition.normal = new Color(1, 0, 0, 1);
    button.addTransition(colorTransition);

    // target 指向克隆节点子节点的组件
    const scaleTransitionOne = new ScaleTransition();
    scaleTransitionOne.target = text;
    button.addTransition(scaleTransitionOne);

    // target 指向克隆节点同级节点的组件
    const scaleTransitionTwo = new ScaleTransition();
    scaleTransitionTwo.target = commonText;
    button.addTransition(scaleTransitionTwo);
    expect(button.transitions.length).to.eq(3);
  });

  it("Interactive State", () => {
    button.onPointerBeginDrag();
    // InteractiveState.Down
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(1);
    button.onPointerEndDrag();
    // InteractiveState.Normal
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(0);
    button.onPointerEnter();
    // InteractiveState.Pressed
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(2);
    button.onPointerExit();
    // InteractiveState.Normal
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(0);
    button.interactive = false;
    // InteractiveState.Disable
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(3);
    button.interactive = true;
    // InteractiveState.Normal
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(0);
    button.entity.addComponent(UIGroup).interactive = false;
    // InteractiveState.Normal
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(0);
    canvasEntity.addComponent(UICanvas);
    // InteractiveState.Disable
    // @ts-ignore
    expect(button._getInteractiveState()).to.eq(3);
  });

  it("clone", () => {
    const cloneButtonEntity = buttonEntity.clone();
    const cloneButton = cloneButtonEntity.getComponent(Button);
    const cloneTransitions = cloneButton.transitions;
    const cloneTransition = cloneTransitions[0];
    expect(cloneTransition.target).to.eq(cloneButtonEntity.getComponent(Image))

    const cloneTransitionOne = cloneTransitions[1];
    expect(cloneTransitionOne.target).to.eq(cloneButtonEntity.findByName("Text").getComponent(Text));

    const cloneTransitionTwo = cloneTransitions[2];
    expect(cloneTransitionTwo.target).to.eq(commonText);
  })
});
