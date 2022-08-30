
import { WickedSheet } from "./wicked-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WickedSheet}
 */
export class WickedClockSheet extends WickedSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
          classes: ["wicked-ones", "sheet", "actor"],
          template: "systems/wicked-ones/templates/actors/clock-sheet.html",
      width: 600,
      height: 390,
    });
  }

	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
    const sheetData = await super.getData(options);
    sheetData.editable = this.options.editable;

    sheetData.actor = sheetData.data;
    sheetData.system = sheetData.data.system // project system data so that handlebars has the same name and value paths
    sheetData.notes = await TextEditor.enrichHTML(this.object.system.notes, { async: true });

    // Override Code for updating the sheet goes here

    return sheetData;
  }

	/* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

    let image_path = `/systems/wicked-ones/styles/assets/progressclocks-webp/${formData['system.style']}-${formData['system.type']}-${formData['system.value']}.webp`;

    formData['img'] = image_path;
    formData['token.img'] = image_path;

    let update = {
      texture: { src: image_path }
    };

		let tokens = this.actor.getActiveTokens();
    let data = [];

    tokens.forEach(function (token) {
			data.push(mergeObject(
				{_id: token.id},
				update
			));
    });

    await TokenDocument.updateDocuments(data, {parent: game.scenes.current});

    // Update the Actor
    return this.object.update(formData);
  }

  /* -------------------------------------------- */

}
