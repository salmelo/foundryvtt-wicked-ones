
import { BladesSheet } from "./wicked-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesClockSheet extends BladesSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
          classes: ["wicked-ones", "sheet", "actor"],
          template: "systems/wicked-ones/templates/actors/clock-sheet.html",
      width: 700,
      height: 970,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

      let image_path = `/systems/wicked-ones/styles/assets/progressclocks-svg/Progress Clock ${formData['data.type']}-${formData['data.value']}.svg`;
    formData['img'] = image_path;
    formData['token.img'] = image_path;

    let data = {
      img: image_path,
      width: 1,
      height: 1,
      scale: 1,
      mirrorX: false,
      mirrorY: false,
      tint: "",
      displayName: 50
    };

    let tokens = this.actor.getActiveTokens();

    tokens.forEach(function(token) {
      token.update(data);
    });

    // Update the Actor
    return this.object.update(formData);
  }

  /* -------------------------------------------- */

}
