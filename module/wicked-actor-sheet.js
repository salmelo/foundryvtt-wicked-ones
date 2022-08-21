
import { WickedSheet } from "./wicked-sheet.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {WickedSheet}
 */
export class WickedActorSheet extends WickedSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
          classes: ["wicked-ones", "sheet", "actor"],
          template: "systems/wicked-ones/templates/actor-sheet.html",
      width: 820,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const sheetData = await super.getData(options);
    sheetData.editable = this.options.editable;

    sheetData.system = sheetData.document.system // project system data so that handlebars has the same name and value paths
    sheetData.notes = await TextEditor.enrichHTML(this.object.system.description, { async: true });

    // look for abilities that change the number of gold, supply and dark heart icons
    // also check for Doomseeker rays and add translations
    sheetData.items.forEach(i => {
      if (i.type == "specialability") {
        if (i.name == game.i18n.localize("FITD.GAME_LOGIC.PackMule")) {
          sheetData.actor.system.supply.max += 1;
        } else if (i.name == game.i18n.localize("FITD.GAME_LOGIC.StickyFingers")) {
          sheetData.actor.system.gold.max += 1;
        } else if (i.name == game.i18n.localize("FITD.GAME_LOGIC.Lair") && i.system.primal.gm_path_value == 3) {
          sheetData.actor.system.dark_hearts.max += 1;
        } else if (i.name == game.i18n.localize("FITD.GAME_LOGIC.GearLocker")) {
          sheetData.actor.system.supply.max += 1;
        } else if (i.system.ability_type == "ds_eyes") {
          for (var j = 1; j < 10; j++) {
            i.system.primal['ds_eye_ray_' + j + '_name'] = game.i18n.localize(CONFIG.WO.doomseeker_eye_rays[i.system.primal['ds_eye_ray_' + j]] + '.Name');
            i.system.primal['ds_eye_ray_' + j + '_tooltip'] = game.i18n.localize(CONFIG.WO.doomseeker_eye_rays[i.system.primal['ds_eye_ray_' + j]] + '.Tooltip');
          }
        }
      }
    });

    // check if Braineater and remove invoke skill
    if (sheetData.actor.system.primal_monster_type == game.i18n.localize("FITD.GAME_LOGIC.Braineater")) {
      delete sheetData.actor.system.attributes.guts.skills.invoke;
    }

    // Get list of minions
    sheetData.actor.system.existing_minions = game.actors.filter(entry => entry.type === "minion_pack");
    let found = false;
    sheetData.actor.system.existing_minions.forEach(i => {
      if (i.id == sheetData.actor.system.minionpack) {
        found = true;
      }
    });
    if (!found) {
      sheetData.actor.system.minionpack = "";
    }

    return sheetData;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-open-editor').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
			item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });
  }

  /* -------------------------------------------- */

}
