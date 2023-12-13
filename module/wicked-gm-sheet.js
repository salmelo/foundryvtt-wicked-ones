import { wickedRoll } from "./wicked-roll.js";
import { WickedSheet } from "./wicked-sheet.js";

/**
 * @extends {WickedSheet}
 */
export class WickedGMSheet extends WickedSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
          classes: ["wicked-ones", "sheet", "gamemaster"],
          template: "systems/wicked-ones/templates/gm-sheet.html",
      width: 830,
      height: 850,
      tabs: [{ navSelector: ".tabs", contentSelector: ".tab-content", initial: "clocks" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const sheetData = await super.getData(options);
    sheetData.editable = this.options.editable;

    sheetData.actor = sheetData.data;
    sheetData.system = sheetData.document.system // project system data so that handlebars has the same name and value paths
    sheetData.notes = await TextEditor.enrichHTML(this.object.system.description, { async: true });

    // Progressivly count up the invasion items
    let invasions = []
    let invasion_count = 0;

    sheetData.items.forEach(i => {
      if (i.type == "invasion") {
        let invasion = i;
        invasion.system.inv_number = ++invasion_count;
        invasions.push(invasion);
      }
    });

    sheetData.invasions = invasions;

    // Add a hint for the selected phase and scaffold HTML
    sheetData.system.phase_hint = "<ul>";
    for (var i = 1; i < 10; i++) {
      let new_hint = "FITD.CYCLE.PHASE" + sheetData.system.current_phase.value + ".Hint" + i;
      let new_hint_loc = game.i18n.localize(new_hint);
      if (new_hint == new_hint_loc) {
        break;
      }
      sheetData.system.phase_hint += "<li>" + new_hint_loc + "</li>"
    }
    sheetData.system.phase_hint += "</ul>";

    return sheetData;
  }


  /* -------------------------------------------- */


  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    html.find(".gm-roll").click(this._onGmRollClick.bind(this));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    // Update Inventory Item
    html.find('.item-open-editor').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.document.items.get(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    // Add a new Adventurer --> Change to player, clock, invasion ...
    html.find('.add-item').click(ev => {
      WickedHelpers._addOwnedItem(ev, this.actor);
    });

  }

  /* -------------------------------------------- */
  /*  Form Submission  (Check relevance)          */
	/* -------------------------------------------- */

  /** @override */
  async _updateObject(event, formData) {

    // Update the Item
    super._updateObject(event, formData);
  }
  /* -------------------------------------------- */

  async _onGmRollClick(event){
    let target = $(event.currentTarget)
    const roll_type = target.data("rollType");
    const roll_default = target.data("rollDefault") ?? 2;

    new Dialog({
      title: `Dice Roller`,
      content: `
        <h2>${game.i18n.localize("FITD.RollSomeDice")}</h2>
        <p>${game.i18n.localize("FITD.RollTokenDescription")}</p>
        <form id="dice-roller">
      <div class="form-group">
      <label>${game.i18n.localize('FITD.RollType')}:</label>
      <select id="type" name="type">
        <option value="fortune" ${roll_type == 'fortune' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.FORTUNE.Name')}</option>
        <option value="blowback" ${roll_type == 'blowback' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.BLOWBACK.Name')}</option>
        <option value="calamity" ${roll_type == 'calamity' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.CALAMITY.Name')}</option>
        <option value="discovery" ${roll_type == 'discovery' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.DISCOVERY.Name')}</option>
        <option value="engagement" ${roll_type == 'engagement' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.ENGAGEMENT.Name')}</option>
        <option value="pathing" ${roll_type == 'pathing' ? 'selected' : ''}>${game.i18n.localize('FITD.ROLL.PATHING.Name')}</option>
      </select>
      </div>
          <div class="form-group">
            <label>${game.i18n.localize("FITD.RollNumberOfDice")}:</label>
            <select id="qty" name="qty">
              ${Array(5).fill().map((item, i) => `<option value="${i}" ${roll_default == i ? 'selected' : ''}>${i}D</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: `Roll`,
          callback: (html) => {
            let diceQty = html.find('[name="qty"]')[0].value;
        let type = html.find('[name="type"]')[0].value;
            wickedRoll(diceQty, "", "default", "default", type);
          },
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: game.i18n.localize('Cancel'),
        },
      },
      default: "yes"
    }).render(true);
  }
}
